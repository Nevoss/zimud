import { configScheme } from '../schemes';
import fse from 'fs-extra';
import path from 'path';
import { configFileName, packageJsonFileName, packageName } from '../consts';
import { glob } from 'glob';
import { log, logBlock, logInfo, logSuccess, logWarn } from '../utils/logs';
import { promisify } from 'util';
import { exec as originalExec } from 'child_process';
import InvalidConfigError from '../errors/invalid-config-error';

const exec = promisify(originalExec);

export default async function install() {
	logInfo(`${packageName} install command is running...`);

	if (!(await fse.pathExists(configFileName))) {
		logInfo(
			`${packageName} config file was not found. Run '${packageName} init' if you wish to generate a new one.`
		);

		return;
	}

	const schemaParseResult = configScheme.safeParse(
		await fse.readJSON(configFileName)
	);

	if (!schemaParseResult.success) {
		throw new InvalidConfigError(
			`${packageName} config file is invalid. Run '${packageName} init --force' to generate a new one.`
		);
	}

	const config = schemaParseResult.data;

	if (!config.enabled) {
		logInfo(
			`${packageName} is disabled. change the 'enable' key to 'true' in '${configFileName}' file if you wish.`
		);

		return;
	}

	const globPatterns = config.packages.filter((p) => p.includes('*'));
	const packages = config.packages.filter((p) => !globPatterns.includes(p));

	if (globPatterns.length) {
		const globResult = await Promise.all(
			Object.entries(globPatterns)
				.map(([, pattern]) => pattern)
				.map((pattern) => glob(pattern))
		);

		packages.push(...globResult.flat());
	}

	// Run over the packages and make sure the paths are valid.
	const packagesPaths = packages
		.map((dirPath) => path.resolve(dirPath))
		.map((dirPath) => {
			const valid = fse.pathExistsSync(
				`${dirPath}/${packageJsonFileName}`
			);

			try {
				const pkg = fse.readJSONSync(
					`${dirPath}/${packageJsonFileName}`
				);

				return {
					name: valid && pkg?.name ? pkg.name : dirPath,
					valid,
					path: dirPath,
				};
			} catch (e) {
				return {
					name: dirPath,
					valid: false,
					path: dirPath,
				};
			}
		});

	const validPackages = packagesPaths.filter((p) => p.valid);
	const invalidPackages = packagesPaths.filter((p) => !p.valid);

	if (validPackages.length === 0) {
		logWarn(`${packageName} has no valid packages to install.`);
	} else {
		await exec(
			[
				'npm install',
				...validPackages.map((p) => p.path),
				'--no-package-lock',
				'--no-save',
			].join(' ')
		);

		logBlock(() => {
			logSuccess(
				`${packageName} has successfully installed the following packages:`
			);

			validPackages.forEach((p) => log(`   - ${p.name}`));
		});
	}

	if (invalidPackages.length) {
		logBlock(() => {
			logWarn(
				'Some packages are not installed because they are invalid. Please check the following packages:'
			);

			invalidPackages.forEach((p) => log(`   - ${p.name}`));
		});
	}
}
