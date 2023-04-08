"use strict";

const path = require("path");

const { Request } = require("../../utils/request");
const { Response } = require("../../utils/response");
const { dynamoClient } = require("../../aws/dynamo");
const { encodeURL } = require("../../utils/formatting");
const { generateRecipeMarkdown, generateToCItem } = require("../../markdown/markdown");

const { v4: createUuid } = require("uuid");
const { GitRepo } = require("../../git/git");

const {
  GITHUB_USER,
  GITHUB_TOKEN,
  GITHUB_REPO,
  GITHUB_BRANCH,
  RECIPES_TABLE_NAME,
  README_FILEPATH,
  RECIPES_DIRECTORY
} = process.env;

module.exports.handler = async (event) => {
  const request = new Request(event);
  // TODO add validation
  const {
    title,
    ingredients,
    directions,
    tags = []
  } = request.body;
  // TODO move this to request.session
  const { name, email } = event.requestContext.authorizer.claims;
  // TODO prevent overwriting recipes of the same name

  const uuid = createUuid();
  // Create markdown recipe document
  const markdownDocument = generateRecipeMarkdown({
    title,
    ingredients,
    directions,
    tags
  });
  // Special characters break GH pages default theme
  const markdownFilename = encodeURL(title + ".md");
  const markdownPath = path.join(RECIPES_DIRECTORY, markdownFilename);
  const tableOfContentsItem = generateToCItem(title, markdownPath);

  const gitRepo = new GitRepo({
    url: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    credentials: { username: GITHUB_USER, password: GITHUB_TOKEN }
  });

  await gitRepo.clone();
  await gitRepo.checkout(GITHUB_BRANCH);
  await gitRepo.appendFile(README_FILEPATH, tableOfContentsItem);
  await gitRepo.createFile(markdownPath, markdownDocument);

  const hash = await gitRepo.commit(`Added recipe: ${title}`, {
    name,
    email
  });

  const pushResult = await gitRepo.push();
  if (!pushResult.ok) {
    // TODO error handling
    return new Response("Failed to push changes!", 500);
  }

  const record = {
    uuid,
    title,
    ingredients,
    directions,
    tags,
    markdownPath,
    hash,
    createdDate: Date.now()
  };

  await dynamoClient.put({
    TableName: RECIPES_TABLE_NAME,
    Item: record
  });

  await gitRepo.cleanup();

  return new Response(record, 200);
};
