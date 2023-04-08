import fs from "fs";
import path from "path";
import { v4 as createUuid } from "uuid";
import { handler as createHandler } from "./create";
import { handler as updateHandler } from "./update";
import { encodeURL } from "../../utils/formatting";
import { recipesModel } from "../../models/recipes";
import { GitRepo } from "../../git/git";
import { generateRecipeMarkdown, generateToCItem } from "../../markdown/markdown";

const {
  GITHUB_USER,
  GITHUB_TOKEN,
  GITHUB_REPO,
  GITHUB_BRANCH,
  README_FILEPATH,
  RECIPES_DIRECTORY
} = process.env;

const name = "Micheal Scott";
const email = "micheal@example.com";
let gitRepo;

beforeEach(async () => {
  gitRepo = new GitRepo({
    url: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    credentials: { username: GITHUB_USER, password: GITHUB_TOKEN }
  });
});

afterEach(async () => {
  await gitRepo.cleanup();
});

describe("create recipe endpoint", () => {
  const requestParams = {
    httpMethod: "POST",
    queryStringParameters: null,
    pathParameters: null,
    headers: {
      "content-type": "application/json"
    },
    requestContext: {
      authorizer: {
        claims: {
          name,
          email,
        },
      },
    },
  };

  const title = `Chick Risotto ${createUuid()}`;
  const ingredients = "- foo\n- bar\n- baz\n";
  const directions = "- qux\n- quux\n- corge\n";
  const tags = ["grault", "garply", "waldo"];
  const markdownFilename = encodeURL(title + ".md");
  const markdownPath = path.join(RECIPES_DIRECTORY, markdownFilename);

  test("should create a new post", async () => {
    const result = await createHandler({
      body: JSON.stringify({
        title,
        ingredients,
        directions,
        tags
      }),
      ...requestParams
    });

    // Assert that the response body is what we expect
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({
      uuid: expect.any(String),
      title,
      ingredients,
      directions,
      tags,
      markdownPath,
      hash: expect.any(String),
      createdDate: expect.any(Number)
    });

    // Assert that the record was created correctly in dynamo
    const { items: [recipe] } = await recipesModel
      .query({ uuid: body.uuid })
      .limit(1)
      .execute();

    expect(recipe).toMatchObject({
      uuid: expect.any(String),
      title,
      ingredients,
      directions,
      tags,
      markdownPath,
      hash: expect.any(String),
      createdDate: expect.any(Number)
    });

    // Assert that recipe file was created
    await gitRepo.clone();
    await gitRepo.checkout(GITHUB_BRANCH);
    const recipeFile = await fs.promises.readFile(path.join(gitRepo.dir, RECIPES_DIRECTORY, markdownFilename), "utf8");
    expect(recipeFile).toBe(generateRecipeMarkdown({
      title,
      ingredients,
      directions,
      tags
    }));

    // Assert that README file was updated
    const readmeFile = await fs.promises.readFile(path.join(gitRepo.dir, README_FILEPATH), "utf8");
    expect(readmeFile).toMatch(generateToCItem(title, markdownPath));

    // Assert that commit details are what we expect
    const [log] = await gitRepo.log(1);
    expect(log.commit.message).toBe(`Added recipe: ${title}\n`);
    expect(log.commit.author).toMatchObject({
      name,
      email,
    });
    expect(log.commit.committer).toMatchObject({
      name,
      email,
    });
  }, 20000);
});

describe("update recipe endpoint", () => {
  let requestParams;

  const title = `Chick Risotto ${createUuid()}`;
  const ingredients = "- chicken\n- rice\n- broth\n";
  const directions = "- cook chicken\n- make risotto\n- profit\n";
  const tags = ["chicken", "risotto", "rice"];
  const markdownFilename = encodeURL(title + ".md");
  const markdownPath = path.join(RECIPES_DIRECTORY, markdownFilename);
  
  beforeAll(async () => {
    const { items } = await recipesModel
      .scan()
      .limit(1)
      .execute();
    const [{ uuid }] = items;
  
    requestParams = {
      httpMethod: "PATCH",
      queryStringParameters: null,
      pathParameters: {
        uuid
      },
      headers: {
        "content-type": "application/json"
      },
      requestContext: {
        authorizer: {
          claims: {
            name,
            email,
          },
        },
      },
    };
  
  });
  
  test("should create a new post", async () => {
    const result = await updateHandler({
      body: JSON.stringify({
        title,
        ingredients,
        directions,
        tags
      }),
      ...requestParams
    });
  
    // Assert that the response body is what we expect
    const body = JSON.parse(result.body);
    expect(body).toMatchObject({
      uuid: expect.any(String),
      title,
      ingredients,
      directions,
      tags,
      markdownPath,
      hash: expect.any(String),
      createdDate: expect.any(Number)
    });
  
    // Assert that the record was created correctly in dynamo
    const { items: [recipe] } = await recipesModel
      .query({ uuid: body.uuid })
    
      .limit(1)
      .execute();
  
    expect(recipe).toMatchObject({
      uuid: expect.any(String),
      title,
      ingredients,
      directions,
      tags,
      markdownPath,
      hash: expect.any(String),
      createdDate: expect.any(Number)
    });
  
    // Assert that recipe file was created
    await gitRepo.clone();
    await gitRepo.checkout(GITHUB_BRANCH);
    const recipeFile = await fs.promises.readFile(path.join(gitRepo.dir, RECIPES_DIRECTORY, markdownFilename), "utf8");
    expect(recipeFile).toBe(generateRecipeMarkdown({
      title,
      ingredients,
      directions,
      tags
    }));
  
    // Assert that README file was updated
    const readmeFile = await fs.promises.readFile(path.join(gitRepo.dir, README_FILEPATH), "utf8");
    expect(readmeFile).toMatch(generateToCItem(title, markdownPath));
  
    // Assert that commit details are what we expect
    const [log] = await gitRepo.log(1);
    expect(log.commit.message).toBe(`Updated recipe: ${title}\n`);
    expect(log.commit.author).toMatchObject({
      name,
      email,
    });
    expect(log.commit.committer).toMatchObject({
      name,
      email,
    });
  }, 20000);  
});