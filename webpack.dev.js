var webpack = require('webpack');
var path = require('path');
var libraryName = 'express-mock-rest-api';
var outputFile = libraryName + '.js';

var config = {
    entry: __dirname + '/src/index.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/lib',
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    externals : {
        express : "express",
        "body-parser" : "body-parser",
        "cors" : "cors",
        "es6-shim" : "es6-shim",
        "mock-response-handler" : "mock-response-handler"
    },
    module: {
        loaders: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel?presets[]=es2015',
                exclude: /(node_modules|bower_components)/
            },
            { test: /\.json$/,  loader: 'json-loader'}
        ]
    },
    resolve: {
        root: path.resolve('./src'),
        extensions: ['', '.js']
    }
};

module.exports = config;