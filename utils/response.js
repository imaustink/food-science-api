"use strict";

class Response {
  constructor(body, status, headers) {
    const isObject = typeof body === "object";
    this.body = isObject ? JSON.stringify(body) : body;
    this.statusCode = status;
    this.headers = Object.assign({
      "content-type": (isObject ? "application/json" : "text/plain"),
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Amzn-Trace-Id"
    }, headers);
  }
  body = null
  statusCode = null;
  isBase64Encoded = false;
};
module.exports = { Response };