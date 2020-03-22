import * as webpack from "webpack";

import { TsConfigPathsPlugin } from "awesome-typescript-loader";

// Webpack configuration docs:
// https://webpack.js.org/configuration
const IndexConfig: webpack.Configuration = {

    entry: "./src/index.ts",

    output: {
        path: `${__dirname}/../build`,
        filename: "simple-mutation-observer.dev.js",
        libraryTarget: "commonjs"
    },

    resolve: {
        extensions: [".ts", ".js", ".json"],
        plugins: [new TsConfigPathsPlugin()],
    },

    module: {
        rules: [
            // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.ts$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    mode: "development",

    devtool: "inline-source-map"
};

export default IndexConfig;
