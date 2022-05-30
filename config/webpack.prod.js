// webpack.prod.js生成模式
const path = require('path')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
// 提取样式成单独文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 压缩样式文件
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
// 压缩js
const TerserWebpackPlugin = require('terser-webpack-plugin')
// 图片压缩
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
// 编译vue文件
const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require('webpack')

const getStyleLoaders = (preProcessor) => {
  // [].filter(Boolean)：过滤掉数组中为undefined的项
  return [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            'postcss-preset-env', // 能解决大多数样式兼容性问题
          ],
        },
      },
    },
    preProcessor,
  ].filter(Boolean)
}

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'static/js/[name].[contenthash:10].js',
    chunkFilename: 'static/js/[name].[contenthash:10].chunk.js',
    assetModuleFilename: 'static/js/[hash:10][ext][query]',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        oneOf: [
          // 处理样式
          {
            test: /\.css$/,
            use: getStyleLoaders(),
          },
          {
            test: /\.less$/,
            use: getStyleLoaders('less-loader'),
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoaders('sass-loader'),
          },
          {
            test: /\.styl$/,
            use: getStyleLoaders('stylus-loader'),
          },
          // 处理图片 (asset可以将图片转成base64格式)
          {
            test: /\.(png|jpe?g|gif|svg)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
              },
            },
          },
          // 处理其它文件 (asset/resource是将文件原封不动的输出)
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
          },
          {
            test: /\.js$/,
            include: path.resolve(__dirname, '../src'),
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules',
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        '../node_modules/.cache/.eslintcache'
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // 将public下面的资源复制到dist目录去（除了index.html）
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../dist'),
          toType: 'dir',
          noErrorOnMissing: true, // 不生成错误
          globOptions: {
            // 忽略文件(public下面的index.html文件会通过HtmlWebpackPlugin插件引入)
            ignore: ['**/index.html'],
          },
          info: {
            // 跳过terser压缩js
            minimized: true,
          },
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:10].css',
      chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
    }),
    new VueLoaderPlugin(),
    // 定义环境变量，解决vue3页面内部警告的问题
    // corss-env定义的环境变量是给webpack打包工具使用的
    // DefinePlugin定义的环境变量是给源代码使用的
    // __VUE_OPTIONS_API__：是否允许使用options_api
    // __VUE_PROD_DEVTOOLS__：生产模式下，vue开发工具是否出现
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    },
    // 压缩的操作
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserWebpackPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    'preset-default',
                    'prefixIds',
                    {
                      name: 'sortAttrs',
                      params: {
                        xmlnsOrder: 'alphabetical',
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
  },
  resolve: {
    // 自动补全文件扩展名，让jsx可以使用(引入文件，这些文件扩展名可以省略)
    extensions: ['.vue', '.js', '.json'],
  },
  mode: 'production',
  devtool: 'source-map',
}
