const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: {
		main: [ './index.ts' ]
	},
	output: {
		filename: 'bundle.js'
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [ '.ts', '.tsx', '.js' ]
	},
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
				use: [ 'style-loader', 'css-loader', 'sass-loader?sourceMap' ]
			}
		]
	},
	devServer: {
		contentBase: path.join(__dirname, '../dist'),
		compress: false,
		port: 8080
	}
};
