/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = () => {
    return {
        devtool: 'inline-sourcemap',
        entry: './src/main.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js'
        },
        resolve: {
            extensions: ['.js']
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader!sass-loader' })
                }
            ],
        },
        plugins: [
            new ExtractTextPlugin( "index.css" ),
            new HtmlWebpackPlugin({
                title: '12 Build Tools and Deployment',
                template: 'src/template.ejs'
            }),
            new CleanWebpackPlugin(['dist/*'], {
                root: path.resolve(__dirname),
                verbose: true, 
                dry: false
            })
        ],
        devServer: {
            contentBase: path.resolve(__dirname, 'dist'),
            port: 4200
        }
    };
};