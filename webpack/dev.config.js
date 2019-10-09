const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: {
		main: [ './index.ts' ]
	},
	output: {
		filename: 'exporter/bundle.js'
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [ '.ts', '.tsx', '.js' ]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'exporter/main.css'
		})
	],
	module: {
		rules: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					allowTsInNodeModules: true
				}
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader',
					'sass-loader'
				]
			}
		]
	},
	devServer: {
		contentBase: path.join(__dirname, '../dist'),
		compress: false,
		port: 8080
	}
};
