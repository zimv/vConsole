const pkg = require('./package.json');
const Webpack = require('webpack');
const Path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const sveltePreprocess = require('svelte-preprocess');


module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  return {
    mode: argv.mode,
    devtool: false,
    entry: {
      vconsole: Path.resolve(__dirname, './src/vconsole.ts'),
    },
    target: ['web', 'es5'],
    output: {
      path: Path.resolve(__dirname, './dist'),
      filename: '[name].min.js',
      library: {
        name: 'VConsole',
        type: 'umd',
        umdNamedDefine: true,
        export: 'default',
      },
    },
    resolve: {
      extensions: ['.ts', '.js', '.html', '.less', '.mjs', '.svelte'],
      alias: {
        svelte: Path.resolve('node_modules', 'svelte'),
      },
      mainFields: ['svelte', 'browser', 'module', 'main'],
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|mjs)$/,
          use: [
            { loader: 'babel-loader' }
          ]
        },
        {
          test: /\.html$/,
          // loader: 'html-loader?minimize=false'
          use: [
            {
              loader: 'html-loader',
              options: { minimize: false },
            },
          ],
        },
        {
          test: /\.(less|css)$/i,
          // loader: 'style-loader!css-loader!less-loader'
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            {
              loader: 'less-loader',
              options: {
                lessOptions: { math: 'always' },
              },
            },
          ],
        },
        {
          test: /\.(svelte)$/,
          use : [
            { loader: 'babel-loader' },
            {
              loader: 'svelte-loader',
              options: {
                preprocess: sveltePreprocess({
                  sourceMap: isDev,
                }),
                compilerOptions: {
                  dev: isDev,
                },
                emitCss: !isDev,
                hotReload: isDev,
              },
            }
          ]
        },
        {
          // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    stats: {
      colors: true,
    },
    optimization: {
      minimize: !isDev,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
    plugins: [
      new Webpack.BannerPlugin({
        banner: [
          'vConsole v' + pkg.version + ' (' + pkg.homepage + ')',
          '',
          'Tencent is pleased to support the open source community by making vConsole available.',
          'Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.',
          'Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at',
          'http://opensource.org/licenses/MIT',
          'Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.',
        ].join('\n'),
        entryOnly: true,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: Path.resolve(__dirname, './src/vconsole.d.ts'),
            to: Path.resolve(__dirname, './dist/vconsole.min.d.ts'),
          },
        ],
      }),
    ],
  };
};
