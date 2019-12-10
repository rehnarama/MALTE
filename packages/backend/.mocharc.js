module.exports = {
  require: ["ts-node/register", "source-map-support/register"],
  extension: ["ts"],
  "watch-files": ["src/**/*.ts"],
  spec: "src/**/*.test.ts",
  exit: true
};
