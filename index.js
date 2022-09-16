const jwt = require('jsonwebtoken');
const axios = require('axios');

const URI_PUBLIC_KEYS_MS = 'https://api.memberstack.io/metadata/v1/public-keys';

/**
 * Retrieve public key, used for signing token, in memberstack website
 *
 * @param  {String} tokenHeader token header (decoded by jwt)
 * @return {String}             Public Key used to sign the token (by Memberstack)
 */
const retrievePublicKey = async (tokenHeader) => {
  try {
    const data = await axios.get(URI_PUBLIC_KEYS_MS);
    if (!data.data[tokenHeader.kid]) {
      throw new Error('No kid corresponding');
    }
    return data.data[tokenHeader.kid];
  } catch (err) {
    throw new Error(`While getting key [${tokenHeader.kid}] at ${URI_PUBLIC_KEYS_MS}:\nerr=${err}`);
  }
};

/**
 * decode memberstack token and return ms user
 *
 * @param  {String} token token (encoded by memberstack)
 * @return {Object}       memberstack user
 */
const verifyAndGetUser = async (token) => {
  try {
    const { header } = jwt.decode(token, { complete: true });
    const publicKey = await retrievePublicKey(header);
    const user = await jwt.verify(token, publicKey, { alg: header.alg });
    return user;
  } catch (err) {
    throw new Error(`verify-memberstack-token error :\nerr=${err}`);
  }
};

module.exports = {
  verifyAndGetUser,
};
