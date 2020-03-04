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

module.exports = {
    target: 'web',
    mode: 'production',
    entry: './src/WorkspaceSearch.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'workspace-search.umd.js',
        library: 'WorkspaceSearch',
        libraryTarget: 'umd',
        umdNamedDefine: true,
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
};
