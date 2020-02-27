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
    mode: 'development',
    entry: './src/WorkspaceSearch.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'workspace_search_bundle.js',
        libraryTarget: 'umd'
    }
};
