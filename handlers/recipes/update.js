const path = require("path");

const { Request } = require("../../utils/request");
const { Response } = require("../../utils/response");
const { recipesModel } = require("../../models/recipes");
const { encodeURL } = require("../../utils/formatting");
const { generateRecipeMarkdown } = require("../../markdown/markdown");

const { GitRepo } = require("../../git/git");

const {
  GITHUB_USER,
  GITHUB_TOKEN,
  GITHUB_REPO,
  GITHUB_BRANCH,
  README_FILEPATH,
  RECIPES_DIRECTORY
} = process.env;

module.exports.handler = async (event) => {
  const request = new Request(event);
  const { uuid } = request.params;
  // TODO add validation

  // TODO move this to request.session
  const { name, email } = event.requestContext.authorizer.claims;
  const { items: [oldRecipe] } = await recipesModel
    .query({ uuid })
    .limit(1)
    .execute();

  if (!oldRecipe) {
    return new Response("Not Found!", 404);
  }

  // TODO trim title?
  const recipe = { ...oldRecipe, ...request.body };

  const {
    title,
    ingredients,
    directions,
    tags = []
  } = recipe;

  const gitRepo = new GitRepo({
    url: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    credentials: { username: GITHUB_USER, password: GITHUB_TOKEN }
  });

  await gitRepo.clone();
  await gitRepo.checkout(GITHUB_BRANCH);

  // Special characters break GH pages default theme
  const markdownFilename = encodeURL(title + ".md");
  const updatedMarkdownPath = path.join(RECIPES_DIRECTORY, markdownFilename);
  const titleChanged = oldRecipe.title !== request.body.title;

  if (titleChanged) {
    // TODO create redirect?
    const currentTableOfContentsItem = `- [${oldRecipe.title}](${oldRecipe.markdownPath})\n`;
    const updatedTableOfContentsItem = `- [${title}](${updatedMarkdownPath})\n`;
    await gitRepo.replaceFileContent(README_FILEPATH, currentTableOfContentsItem, updatedTableOfContentsItem);
    await gitRepo.deleteFile(oldRecipe.markdownPath);
  }

  if (
    titleChanged ||
    oldRecipe.ingredients !== request.body.ingredients ||
    oldRecipe.directions !== request.body.directions ||
    // TODO this is probably not the best way to compare tags
    oldRecipe.tags.join(",") !== request.body.tags.join(",")
  ) {

    // Create markdown recipe document
    const markdownDocument = generateRecipeMarkdown({
      title,
      ingredients,
      directions,
      tags
    });

    await gitRepo.createFile(updatedMarkdownPath, markdownDocument);
  }

  const hash = await gitRepo.commit(`Updated recipe: ${title}`, {
    name,
    email,
  });

  await gitRepo.push();
  await gitRepo.cleanup();

  const updatedRecipe = {
    ...recipe,
    markdownPath: updatedMarkdownPath,
    hash
  };

  // NOTE: We can't rollback so we should only update when changes are successful
  await recipesModel.put(updatedRecipe);

  return new Response(updatedRecipe, 200);
};
