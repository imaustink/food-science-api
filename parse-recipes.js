const docxParser = require('docx-parser');
const axios = require("axios");

const regex = /(.+)(?:\w+)?\n+ingredients:\n+([\s\S]*?)(?=\n.*?directions)\n+directions:?\n+([\s\S]*?)(?=\n\n)/gmi;
const recipesEndpoint = "https://l3le6qdmsf.execute-api.us-east-1.amazonaws.com/production/recipes";

const { AUTH_TOKEN } = process.env;

docxParser.parseDocx("Recipes-3.docx", function (data) {
  data = `${data}\n\n`
    .replaceAll("½", "1/2")
    .replaceAll("¾", "3/4")
    .replaceAll("¼", "1/4")
    .replaceAll("&amp;", "&")
    .replaceAll("Ke12ut", "halibut")
    .replaceAll("Jim Bill’s Easy BBQ", "Jim Bill’s Easy BBQ Halibut")
  const recipes = [];
  let result;
  while ((result = regex.exec(data)) !== null) {
      const title = result[1].trim();
      const ingredients = "* " + result[2].trim().split("\n").join("\n* ");
      const directions = "* " + result[3].trim().split("\n").join("\n* ");
      const recipe = { title, ingredients, directions, tags: [] };
      // console.log(recipe);
      recipes.push(recipe);
  }
  console.log("count", recipes.length);

  uploadRecipes(recipes);
});


async function uploadRecipes(recipes) {
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    console.log("Creating", recipe.title);
    try {
      const { status, data } = await axios.post(recipesEndpoint, recipe, {
        headers: {
          authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json"
        }
      });
      if (!status === 200) throw new Error(`${status}: ${data}`);
      console.log(data);
    } catch (error) {
      console.error("Failed to create", recipe.title);
      console.error(error);
    }
  }
}