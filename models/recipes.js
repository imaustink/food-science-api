const { dynamoClient } = require("../utils/aws");
const { DynamoDBModel } = require("../utils/dynamo-db-model");

const { RECIPES_TABLE_NAME } = process.env;

const recipesModel = new DynamoDBModel({
    tableName: RECIPES_TABLE_NAME,
    client: dynamoClient
})

module.exports = { recipesModel };