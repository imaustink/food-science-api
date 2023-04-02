const { Request } = require("../../utils/request");
const { Response } = require("../../utils/response");

const { CognitoIdentityProvider } = require("@aws-sdk/client-cognito-identity-provider");
const { getDefaultRoleAssumerWithWebIdentity } = require("@aws-sdk/client-sts");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");

const {
  USER_POOL_ID
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
    password,
    name
  } = request.body;

  const params = {
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: [{
      Name: 'email',
      Value: email
    },
    {
      Name: 'name',
      Value: name
    },
    {
      Name: 'email_verified',
      Value: 'true'
    }],
    MessageAction: 'SUPPRESS'
  }

  const { User: user } = await cognito.adminCreateUser(params);

  const paramsForSetPass = {
    Password: password,
    UserPoolId: USER_POOL_ID,
    Username: email,
    Permanent: true
  };
  await cognito.adminSetUserPassword(paramsForSetPass);

  return new Response({ user }, 200);
};