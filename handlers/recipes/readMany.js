const { Request } = require("../../utils/request");
const { Response } = require("../../utils/response");
const { recipesModel } = require("../../models/recipes");

module.exports.handler = async (event) => {
  const request = new Request(event);
  const { limit = 100, after: exclusiveStartKey } = request.query || {};

  const { items, nextToken } = await recipesModel
    .scan()
    .limit(limit)
    .after(exclusiveStartKey)
    .execute();

  return new Response({ items, nextToken }, 200);
};
