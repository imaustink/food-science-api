const { Request } = require("../../utils/request");
const { Response } = require("../../utils/response");
const { recipesModel } = require("../../models/recipes");


module.exports.handler = async (event) => {
  const request = new Request(event);
  const { uuid } = request.params;

  const { items: [item] } = await recipesModel
    .query({ uuid })
    .limit(1)
    .execute();

  if (!item) {
    return new Response("Not Found!", 404);
  }

  return new Response({ item }, 200);
};
