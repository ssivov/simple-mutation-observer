import { TsConfigPathsPlugin } from "awesome-typescript-loader";
import UglifyJsPlugin from "uglifyjs-webpack-plugin";
import * as webpack from "webpack";

// Webpack configuration docs:
// https://webpack.js.org/configuration
const IndexConfig: webpack.Configuration = {

    entry: "./src/index.ts",

    output: {
        path: `${__dirname}/../build`,
        filename: "simple-mutation-observer.js",
        libraryTarget: "commonjs"
    },

    resolve: {
        extensions: [".ts", ".js", ".json"],
        plugins: [new TsConfigPathsPlugin()],
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                exclude: /(node_modules|bower_components)/,
                use: [{ loader: 'webpack-strip-block' }]
            },

            // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.ts$/, loader: "awesome-typescript-loader" },
        ]
    },

    mode: "production",

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: false
            })
        ]
    },

    performance: {
        // Debug output - not needed in production
        hints: false
    },

    // stats: {
    //     // Debug output - not needed in production
    //     warnings: false
    // }

    stats: {
        // Debug output - not needed in production
        warnings: false
    }
};

export default IndexConfig;
