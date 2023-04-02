function generateRecipeMarkdown({
  title,
  ingredients,
  directions,
  tags
}) {
  return `# ${title.trim()}\n\n## Ingredients\n\n${ingredients}\n\n## Directions\n\n${directions}\n\n__tags:__ ${tags.join(", ")}\n`
}

module.exports = {
  generateRecipeMarkdown
};