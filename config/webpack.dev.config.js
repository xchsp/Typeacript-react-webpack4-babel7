const path = require("path");
const webpack = require('webpack');
const merge = require("webpack-merge");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CircularDependencyPlugin = require('circular-dependency-plugin');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const baseWebpackConfig = require("./webpack.base.config");
const antdTheme = require('../theme')
const ROOTPATH = path.resolve(__dirname)

const webpackDevConfig = merge(baseWebpackConfig, {
  mode: 'development',
  output: {
    path: path.join(ROOTPATH, "../dist"),
    publicPath: '/public/',
  },
  devtool: "inline-source-map",
  devServer: {
    host: '0.0.0.0',
    port: 5555,
    // 静态文件路径
    contentBase: path.resolve(ROOTPATH, "../dist"),
    // hot: true,
    overlay: { // 
      errors: true
    },
    proxy: {
      '/api':
      {
        target: 'http://localhost:2223',
        pathRewrite: { '^/api': '' }
      }
    },
    publicPath: '/public/', // !
    historyApiFallback: {
      index: '/public/index.html'
    }
  },
  module: {
    rules: [
      {
      enforce: "pre", test: /\.js$/,
      loader: "source-map-loader"
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true,
            }
          }
        ]
      },
      {
        test: /\.(less|css)$/,
        use: [
           { loader: 'style-loader' },
          // {
          //    loader: MiniCssExtractPlugin.loader
          // },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer')({
                  browsers: ['last 15 versions']
                }),
                // require('postcss-import')(),
                // require('stylelint')(),
              ]
            }
          },
          {
            loader: 'less-loader',
            options: {
              modifyVars: antdTheme,
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[ext]',
              outputPath: 'assets/fonts/'
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: { // 通过options 配置路径
              name: '[name].[ext]',
              limit: 8192,
              outputPath: 'assets/imgs/'
            }
          },
          {
            loader: 'img-loader', // 图片压缩
            options: {
              pngquant: {
                quality: 80
              }
            }
          }
        ]
      }

    ]
  },
  plugins: [
    // new MiniCssExtractPlugin({
      
    //   filename: '[name].css'
    // }),
    new webpack.DefinePlugin({
      "process.env": require("./dev.env")
    }),
    // 循环依赖预警
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    // new BundleAnalyzerPlugin() // 包分析器
    //    new CompressionPlugin({ //gzip
    //   test: /\.js$|\.css$/,
    //   cache: true,
    //   asset: '[path].gz[query]',
    //   algorithm: 'gzip',
    //   threshold: 0,
    //   minRatio: 0.8,
    //   deleteOriginalAssets: true
    // }),
    // --
  ]
})

module.exports = webpackDevConfig;