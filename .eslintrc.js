module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['./test/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],
};
