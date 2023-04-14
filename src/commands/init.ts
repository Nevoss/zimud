import { logBlock, logInfo, logSuccess } from '../utils/logs';
import fse from 'fs-extra';
import { configFileName, packageName } from '../consts';
import { Config } from '../schemes/config';
import ConfigFileExistsError from '../errors/config-file-exists-error';

export default async function init({ force }: { force: boolean }) {
	logInfo(`${packageName} init command is running...`);

	if ((await isConfigFileExists(configFileName)) && !force) {
		throw new ConfigFileExistsError(
			`${packageName} config file already exists. Run '${packageName} init --force' to generate a new one.`
		);
	}

	await createConfigFile(configFileName);

	// TODO: Add plink config file to .gitignore if exists, otherwise log a warning.

	logBlock(() => {
		logSuccess(`${packageName} config file was generated successfully.`);
	});
}

async function isConfigFileExists(configFileName: string) {
	return await fse.pathExists(configFileName);
}

async function createConfigFile(configFileName: string) {
	const config: Config = {
		enabled: true,
		packages: [],
	};

	await fse.writeJSON(configFileName, config, { spaces: 2 });
}
