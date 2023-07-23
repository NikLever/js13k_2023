import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin }from 'clean-webpack-plugin';

export const plugins = [
	new HtmlWebpackPlugin({ template: "src/index.html", inject: "body", scriptLoading: "module" }),
    new CleanWebpackPlugin(),
	];
export const resolve = { extensions: [".ts", ".js"] };
export const module = {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/
			},
			{
				test: /\.(png|jpg|gif|wav)$/i,
				type: "asset/inline",
			},
			{
				test: /\.glsl$/i,
				use: "raw-loader"
			}
		]
	};
export const mode = 'development';
export const devtool = "eval-source-map";
export const devServer = {
            hot: false,
            host: "0.0.0.0"
    };