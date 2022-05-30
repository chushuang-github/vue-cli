module.exports = {
  root: true,
  env: {
    node: true,
  },
  // eslint继承vue官方的规则，这里继承的包不用下载的
  extends: ["plugin:vue/vue3-essential", "eslint:recommended"],
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
};