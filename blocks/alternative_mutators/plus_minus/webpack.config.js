/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Webpack configuration file.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

const path = require('path');
const webpack = require('webpack');

module.exports = env => {
    return {
        target: 'web',
        mode: env.mode,
        entry: './src/blocks.js',
        devtool: 'source-map',
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/dist/',
            filename: 'plus-minus-mutators.umd.js',
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }]
        },
        devServer: {
            openPage: 'test',
            port: 3000,
            open: true
        },
        externals: {
            'blockly/core': {
                root: 'Blockly',
                commonjs: 'blockly/core',
                commonjs2: 'blockly/core',
                amd: 'blockly/core'
            },
        }
    }
};
