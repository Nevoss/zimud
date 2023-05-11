module.exports = {
	verbose: true,
	transform: {
		'\\.ts$': [
			'babel-jest',
			{
				presets: ['@babel/preset-typescript'],
				plugins: [['@babel/plugin-transform-modules-commonjs']],
			},
		],
	},
};
