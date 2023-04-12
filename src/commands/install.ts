import {configScheme} from '../schemes';
import fse from 'fs-extra';
import path from 'path';
import {configFileName} from '../consts';
import spawn from "../utils/spawn";
import {glob} from "glob";

export default async function install() {
	// Check if config file exists.
	// Check if config file is valid.
	const config = configScheme.parse(await fse.readJSON(configFileName));

	if ( ! config.enabled || config.packages.length === 0) {
		// Prompt user that the config is disabled.

		return;
	}

	// Run over the packages and make sure the paths are valid.
	const packagesPaths: string[] = (
		await Promise.all(
			Object.entries(config.packages)
				.map(([, pattern]) => pattern)
				.map(pattern => glob(pattern) )
		)
	)
		.flat()
		.map((dirPath) => path.resolve(dirPath));

	// Check which package manager the user is using.
	await spawn(
		'npm',
		['install', ...packagesPaths, '--no-package-lock', '--no-save'],
		{stdio: 'inherit'}
	);

	// Make sure to prompt big message that says something like "Those packages x, y and z are installed via `plink`".
}
