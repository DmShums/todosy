const path = require('path')
const MiniCssExtractPlugin = require(`mini-css-extract-plugin`);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    `./src/js/main.js`,
    `./src/static/styles/styles.css`
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'client')
  },
  devServer: {
    port: 8080,
    hot: true,
    watchFiles: ['./src/**/*']
  },
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [
                  require('autoprefixer')
                ]
              }
            }
          },
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `./css/style.bundle.css`
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: './src/templates/index.html'
    }),
    new HtmlWebpackPlugin({
      filename: "login.html",
      template: './src/templates/login.html'
    }),
    new HtmlWebpackPlugin({
      filename: "register.html",
      template: './src/templates/register.html'
    }),
    new CopyWebpackPlugin({
        patterns: [
          { from: `./src/static/fonts`, to: `./fonts` },
          { from: `./src/static/images`, to: `./images` },
          { from: `./src/static/favicon`, to: `./` }
        ]
    }),
  ]
}