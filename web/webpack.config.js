const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/browser/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      util: require.resolve("util/"),
    },
  },
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "public"),
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
};
