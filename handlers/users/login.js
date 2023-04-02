const { Request } = require("../../utils/request");
const { Response } = require("../../utils/response");

const { CognitoIdentityProvider } = require("@aws-sdk/client-cognito-identity-provider");
const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");

const {
  USER_POOL_ID,
  CLIENT_ID
} = process.env

const credentialProvider = defaultProvider({
  roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity,
});
const cognito = new CognitoIdentityProvider({
  credentialDefaultProvider: credentialProvider
});

module.exports.handler = async (event) => {
  const request = new Request(event);

  const {
    email,
    password
  } = request.body;

  const params = {
    AuthFlow: "ADMIN_NO_SRP_AUTH",
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  }
  try {
    const response = await cognito.adminInitiateAuth(params);
    return new Response({ token: response.AuthenticationResult.IdToken }, 200);
  } catch (error) {
    console.error(error);
    if (error.__type === "NotAuthorizedException") {
      return new Response("Incorrect username or password.", 401);
    }
    return new Response("Internal Server Error", 500);
  }
};