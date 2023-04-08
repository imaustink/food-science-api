const { dynamoClient } = require("../aws/dynamo");
const { DynamoDBModel } = require("./base-model");

const { RECIPES_TABLE_NAME } = process.env;

const recipesModel = new DynamoDBModel({
    tableName: RECIPES_TABLE_NAME,
    client: dynamoClient
})

module.exports = { recipesModel };