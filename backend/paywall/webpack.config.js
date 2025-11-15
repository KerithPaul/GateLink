const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
const webpack = require("webpack");
const { webpackFallback } = require("@txnlab/use-wallet");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    // Ensure relative asset paths; we inline JS anyway
    publicPath: "",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      buffer: require.resolve("buffer/"), // polyfill
      ...webpackFallback,
    },
  },
  module: {
    rules: [
      // Force dynamic imports to be inlined to avoid extra chunks
      {
        test: /\.m?js$/,
        parser: {
          javascript: {
            dynamicImportMode: "eager",
          },
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          "postcss-loader",
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: "body",
    }),
    new HtmlInlineScriptPlugin(), // inlines JS into HTML
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"], // auto polyfill
    }),
    // Hard limit chunks to a single bundle
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
    // Inline all dynamic import boundaries to keep a single bundle
    concatenateModules: false,
    chunkIds: "deterministic",
    moduleIds: "deterministic",
  },
  devServer: {
    static: "./dist",
    hot: true,
    open: true,
  },
};
