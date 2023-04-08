"use strict";

class Request {
  constructor(event) {
    const { body, httpMethod, queryStringParameters, pathParameters, headers } = event;
    this.body = JSON.parse(body);
    this.method = httpMethod;
    this.query = queryStringParameters;
    this.params = pathParameters;
    this.headers = headers;
  }
  body = null;
  method = null;
  params = null;
  query = null;
  headers = null;
}

module.exports = { Request }