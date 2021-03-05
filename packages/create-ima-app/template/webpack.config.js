const path = require('path');
const nodeExternals = require('webpack-node-externals');
var HtmlWebpackPlugin = require('html-webpack-plugin');

let env = process.env.NODE_ENV || 'dev';
if (env === 'production') {
  env = 'prod';
}
const environmentConfig = require(process.cwd() + '/app/environment.js')[env];

const clientConfig = {
  mode: 'production',
  entry: ['./app/main.js'],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build/static/js'),
    assetModuleFilename: '../img/[hash][ext][query]'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      ['app']: path.resolve(__dirname + '/app'),
      '@ima/core': '@ima/core/dist/ima.client.cjs.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              '@babel/preset-react'
            ],
            plugins: []
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: './app/assets/static/html/main.html',
      filename: '../../index.html',
      templateParameters: {
        $Debug: environmentConfig.$Debug,
        $Env: env,
        $App: JSON.stringify(environmentConfig.$App || {}),
        $Language:
          environmentConfig.$Language[
            Object.keys(environmentConfig.$Language)[0]
          ]
      }
    })
  ],
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};

const serverConfig = {
  mode: 'production',
  entry: ['./server/server.js'],
  output: {
    publicPath: '',
    filename: 'server.js',
    path: path.resolve(__dirname, 'build'),
    assetModuleFilename: 'static/img/[hash][ext][query]'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              '@babel/preset-react'
            ],
            plugins: []
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      ['app']: path.resolve(__dirname + '/app'),
      '@ima/core': '@ima/core/dist/ima.server.cjs.js'
    }
  },
  externalsPresets: {
    node: true
  },
  externals: [nodeExternals()],
  node: {
    __dirname: false,
    __filename: false
  }
};

module.exports = [clientConfig, serverConfig];
