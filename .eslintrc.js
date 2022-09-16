module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: 'airbnb',
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 'off', // usefull and not dangerous for node app
  },
};
