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
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
	moduleDirectories: ['node_modules', 'tests', __dirname],
};
