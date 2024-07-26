const path = require('path');
const nodeExternals = require('webpack-node-externals');
const WebpackMd5Hash = require('webpack-md5-hash');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SshWebpackPlugin = require('ssh-webpack-plugin');

module.exports = {
    entry: {
        server: ['@babel/polyfill', path.resolve(__dirname, './server/index.js')],
        getCatalog: ['@babel/polyfill', path.resolve(__dirname, './server/common/getCatalog.js')]
    },
    output: {
        path: path.resolve(__dirname, 'dist/server'),
        publicPath: '/',
        filename: '[name].bundle.js'
    },
    target: 'node',
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false, // if you don't put this is, __dirname
        __filename: false // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([{ from: path.join(__dirname, './client/public/css'), to: '../client/public/css' }]),
        new CopyWebpackPlugin([{ from: path.join(__dirname, './config/default.json'), to: '../config/default.json' }]),
        new CopyWebpackPlugin([
            { from: path.join(__dirname, './config/production.json'), to: '../config/production.json' }
        ]),
        new CopyWebpackPlugin([
            { from: path.join(__dirname, './config/production.json'), to: '../config/production.json' }
        ]),
        new CopyWebpackPlugin([{ from: path.join(__dirname, './client/views'), to: '../client/views' }]),
        new CopyWebpackPlugin([{ from: path.join(__dirname, './package.json'), to: '../' }]),
        new CopyWebpackPlugin([{ from: path.join(__dirname, './ecosystem.config.js'), to: '../' }]),
        new SshWebpackPlugin({
            host: '134.209.156.134',
            port: '22',
            username: 'root',
            privateKey: require('fs').readFileSync(path.resolve('../../.ssh', 'id_rsa')),
            from: path.join(__dirname, './dist'),
            to: '/srv/www/dbexporter',
            after: 'pm2 restart all'
        }),
        new WebpackMd5Hash()
    ]
};
