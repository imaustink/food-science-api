require('dotenv').config();

if (!process.env.GITHUB_TOKEN) {
  console.log("GITHUB_TOKEN environment variable required to run tests");
}

Object.assign(process.env, {
  GITHUB_USER: "imaustink",
  GITHUB_REPO: "https://github.com/imaustink/recipes",
  GITHUB_BRANCH: "e2e-tests",
  RECIPES_TABLE_NAME: "food-science-api-development-recipes",
  README_FILEPATH: "README.md",
  RECIPES_DIRECTORY: "recipes"
});