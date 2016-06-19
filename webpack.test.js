var webpack = require("webpack");
var path = require('path');


module.exports = {
    name : "browser",
    resolve: {
        root: [path.resolve('./src'), path.resolve('node_modules')],
        extensions: ['', '.js']
    },
    devtool: 'cheap-module-eval-source-map',
    debug : true,
    module: {
        loaders: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                },
                exclude: /(node_modules)/
            }
        ]
    }
};