const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    bundle: path.resolve(__dirname, "index.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  target: "node",
  externalsPresets: {
    node: true,
  },
  externals: [nodeExternals()],
};
