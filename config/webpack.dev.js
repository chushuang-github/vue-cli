// webpack.dev.js开发模式
const path = require('path')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
// vue里面需要定义两个环境变量的标识：__VUE_OPTIONS_API__, __VUE_PROD_DEVTOOLS__
// vue内部需要使用这两个标识，不定义的话，控制台会有警告
// 我们这儿的两个环境变量需要在代码内部使用，所以不能使用cross-env来定义
// cross-env定义的环境变量只能给webpack使用
// vue代码里面想要使用这两个环境变量标识，必须使用webpack内部内置的插件DefinePlugin
const { DefinePlugin } = require('webpack')

const getStyleLoaders = (preProcessor) => {
  // [].filter(Boolean)：过滤掉数组中为undefined的项
  return [
    'vue-style-loader',
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
    path: undefined,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    assetModuleFilename: 'static/js/[hash:10][ext][query]',
  },
  module: {
    rules: [
      // 处理vue组件：vue-loader不能放在oneOf里面，不然会报错
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
  },
  resolve: {
    // 自动补全文件扩展名，让jsx可以使用(引入文件，这些文件扩展名可以省略)
    extensions: ['.vue', '.js', '.json'],
  },
  devServer: {
    open: true,
    host: 'localhost',
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true, // 解决react-router刷新404问题
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
}
