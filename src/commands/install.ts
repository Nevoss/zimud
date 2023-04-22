import { configScheme } from '../schemes';
import fse from 'fs-extra';
import path from 'path';
import { configFileName, packageJsonFileName, packageName } from '../consts';
import { glob } from 'glob';
import { log, logInfo, logSuccess, logWarn, spinner } from '../utils/logs';
import { promisify } from 'util';
import { exec as originalExec } from 'child_process';
import InvalidConfigError from '../errors/invalid-config-error';

const exec = promisify(originalExec);

type CommandOptions = {
	dryRun: boolean;
};

export default async function install({ dryRun = false }: CommandOptions) {
	const time = process.hrtime();

	if (!(await isConfigFileExists(configFileName))) {
		logInfo(
			`${packageName} config file was not found. Run '${packageName} init' if you wish to generate a new one.`
		);

		return;
	}

	const config = await parseConfig(configFileName);

	if (!config.enabled) {
		logInfo(
			`${packageName} is disabled. change the 'enable' key to 'true' in '${configFileName}' file if you wish.`
		);

		return;
	}

	const [validPackages, invalidPackages] = groupByValidity(
		await extractPackages(config.packages)
	);

	const messagesFns: (() => void)[] = [];

	if (validPackages.length === 0) {
		messagesFns.push(() => logWarn('No valid packages to install.'));
	}

	if (validPackages.length > 0) {
		if (!dryRun) {
			await spinner(`${packageName} is installing packages...`, () =>
				installPackages(validPackages)
			);
		}

		const packageNames = await extractPackagesNames(validPackages);

		const [secondsTimeDiff, nanosecondsTimeDiff] = process.hrtime(time);

		messagesFns.push(() => {
			logSuccess(
				dryRun
					? 'The following packages would have been installed:'
					: `${packageName} has successfully installed the following packages (in ${secondsTimeDiff}s ${(
							nanosecondsTimeDiff / 1e6
					  ).toFixed()}ms):`
			);
			logPackages(packageNames);
		});
	}

	if (invalidPackages.length) {
		messagesFns.push(() => {
			logWarn(
				dryRun
					? 'The following packages are invalid:'
					: 'Some packages are not installed because they are invalid. Please check the following packages:'
			);
			logPackages(invalidPackages);
		});
	}

	messagesFns.forEach((messageFn, index) => {
		if (index > 0) {
			log('');
		}

		messageFn();
	});
}

async function isConfigFileExists(configFileName: string) {
	return await fse.pathExists(configFileName);
}

async function parseConfig(configFileName: string) {
	try {
		return configScheme.parse(await fse.readJSON(configFileName));
	} catch (e) {
		throw new InvalidConfigError(
			`${packageName} config file is invalid. Run '${packageName} init --force' to generate a new one.`
		);
	}
}

async function extractPackages(packagesPatters: string[]) {
	const globPatterns = packagesPatters.filter((p) => p.includes('*'));
	const paths = packagesPatters.filter((p) => !globPatterns.includes(p));

	if (globPatterns.length) {
		const globResult = await Promise.all(
			Object.entries(globPatterns)
				.map(([, pattern]) => pattern)
				.map((pattern) => glob(pattern))
		);

		paths.push(...globResult.flat());
	}

	return paths.map((p) => path.resolve(p));
}

export function groupByValidity(dirPaths: string[]) {
	return dirPaths.reduce<[string[], string[]]>(
		(carry, dirPath) => {
			const validJSONFile = !!fse.readJSONSync(
				path.resolve(dirPath, packageJsonFileName),
				{
					throws: false,
				}
			);

			carry[validJSONFile ? 0 : 1].push(dirPath);

			return carry;
		},
		[[], []]
	);
}

export async function installPackages(dirPaths: string[]) {
	await exec(
		[
			'npm install',
			...dirPaths.map((dirPath) => dirPath),
			'--no-package-lock',
			'--no-save',
		].join(' ')
	);
}

export async function extractPackagesNames(
	dirPaths: string[]
): Promise<string[]> {
	return await Promise.all(
		dirPaths.map(async (dirPath) => {
			const packageJson = await fse.readJSON(
				path.resolve(dirPath, packageJsonFileName)
			);

			return packageJson?.name || dirPath;
		})
	);
}

export function logPackages(names: string[]) {
	names.forEach((names) => log(`   - ${names}`));
}
