module.exports = {
  extension: [".ts"],
  include: ["src/**/*.ts"],
  exclude: ["**/*.d.ts"],
  all: true,
  reporter: ["text", "html"],
  "report-dir": "coverage"
};
