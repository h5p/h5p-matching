const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const isProd = (process.env.NODE_ENV === 'production');

const extractSass = new ExtractTextPlugin({
  filename: "h5p-matching.css"
});

const config = {
  entry: "./src/entries/dist.js",
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "h5p-matching.js"
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    },
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules'),
    ]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preserveWhitespace: false,
          loaders: {
            scss: extractSass.extract({
              use: [
                {
                  loader: "css-loader?sourceMap"
                },
                {
                  loader: "resolve-url-loader"
                },
                {
                  loader: "sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true"
                }
              ],

              fallback: "style-loader"
            })
          }
        }
      },
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [
            {
              loader: "css-loader?sourceMap"
            },
            {
              loader: "resolve-url-loader"
            },
            {
              loader: "sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true"
            }
          ],

          fallback: "style-loader"
        })
      },
      {
        test: /\.svg$/,
        include: path.join(__dirname, 'src/images'),
        loader: 'svg-inline-loader'
      }
    ]
  },
  plugins: [
    extractSass,
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
};

if(!isProd) {
  config.devtool = 'inline-source-map';
}

module.exports = config;