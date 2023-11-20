const { Request } = require("../../utils/request");
const { Response } = require("../../utils/response");

const { CognitoIdentityProvider } = require("@aws-sdk/client-cognito-identity-provider");
const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");

const { CLIENT_ID } = process.env;

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});
const cognito = new CognitoIdentityProvider({
  credentialDefaultProvider: credentialProvider
});

module.exports.handler = async (event) => {
  const request = new Request(event);

  const { email, password, code } = request.body;

  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: password
  };
  try {
    const response = await cognito.confirmForgotPassword(params);
    const { attempts } = response.$metadata;
    return new Response({ attempts }, 200);
  } catch (error) {
    console.error(error);
    return new Response("Invalid Reset Code!", 401);
  }
};