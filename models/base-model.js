"use strict";

class DynamoDBModel {
  constructor({ tableName, client }) {
    this.tableName = tableName;
    this.client = client;
  }

  query(query) {
    return new QueryInterface(this, query, 'query');
  }

  scan(query) {
    return new QueryInterface(this, query, 'scan');
  }

  put(update) {
    return this.client.put({
      TableName: this.tableName,
      Item: update
    });
  }
}

class QueryInterface {
  constructor(model, query, method) {
    this.query = query;
    this.model = model;
    this.method = method;
  }

  select(fields) {
    this.fields = fields;
    return this;
  }

  limit(limit) {
    this.limit = limit;
    return this;
  }

  after(nextToken) {
    this.nextToken = nextToken;
    return this;
  }

  async execute() {
    const params = {
      TableName: this.model.tableName,
      Limit: this.limit,
      KeyConditionExpression: this.keyConditionExpression,
      ExpressionAttributeNames: this.expressionAttributeNames,
      ExpressionAttributeValues: this.expressionAttributeValues,
      ExclusiveStartKey: this.nextToken,
      ...this.selectStatement
    };
    const result = await this.model.client[this.method](params);
    const { Items: items, LastEvaluatedKey: nextToken } = result;

    return { items, nextToken };
  }

  get selectStatement() {
    return {
      Select: this.fields ? "SPECIFIC_ATTRIBUTES" : "ALL_ATTRIBUTES",
      ProjectionExpression: this.fields ? this.fields.join(", ") : undefined
    };
  }

  get isQuery() {
    return this.query && Object.keys(this.query).length > 0;
  }

  get keyConditionExpression() {
    return this.isQuery ? Object.keys(this.query)
      .map((fieldName) => `#${fieldName} = :${fieldName}Value`)
      .join(" AND ") : undefined;
  }

  get expressionAttributeNames() {
    return this.isQuery ? Object.fromEntries(
      Object.keys(this.query)
        .map((fieldName) => ([`#${fieldName}`, fieldName]))
    ) : undefined;
  }

  get expressionAttributeValues() {
    return this.isQuery ? Object.fromEntries(
      Object.entries(this.query)
        .map(([fieldName, fieldValue]) => ([`:${fieldName}Value`, fieldValue]))
    ) : undefined;
  }
}

module.exports = {
  DynamoDBModel,
  QueryInterface
};