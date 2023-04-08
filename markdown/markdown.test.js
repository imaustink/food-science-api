import { generateRecipeMarkdown, generateToCItem } from "./markdown";

describe("generateRecipeMarkdown", () => {
  test("should generate recipe markdown", () => {
    expect(generateRecipeMarkdown({
      title: " chicken risotto ",
      ingredients: "- chicken\n- broth\n- rice",
      directions: "- cook\n- eat\n- profit",
      tags: ["chicken", "rice"]
    }))
      .toBe("# chicken risotto\n\n## Ingredients\n\n- chicken\n- broth\n- rice\n\n## Directions\n\n- cook\n- eat\n- profit\n\n__tags:__ chicken, rice\n");
  });
});

describe("generateToCItem", () => {
  expect(generateToCItem(
    "chicken risotto",
    "/chicken-risotto"
  ))
    .toBe("- [chicken risotto](/chicken-risotto)\n")
});