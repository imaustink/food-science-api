# Food Science API

A Serverless CMS for recipes used for [https://recipes.kurpuis.com](https://recipes.kurpuis.com).

Recipes are stored as markdown files in a git repo so it's easy to use GitHub pages or similar to distribute the content to the masses and your recipes are inherently version control.

The recipe details are also stored in DynamoDB. This is leveraged when editing recipes to prevent the need to parse the markdown file and will facilitate the implementation of a search index in the future.

## Deploy

`sls deploy --stage=[stage]`

## Install Dependencies

`npm i`

## Test

`npm test`
