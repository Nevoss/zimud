import { logBlock, logInfo, logSuccess, logWarn } from '../utils/logs';
import fse from 'fs-extra';
import { configFileName, gitIgnoreFileName, packageName } from '../consts';
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

	const gitIgnoreModifiedSuccessfully = await appendConfigFileToGitIgnore(
		gitIgnoreFileName,
		configFileName
	);

	logBlock(() => {
		logSuccess(`${configFileName} was generated successfully.`);
		gitIgnoreModifiedSuccessfully
			? logSuccess(`${gitIgnoreFileName} was updated.`)
			: logWarn(
					`Could not read ${gitIgnoreFileName} file. Please add ${configFileName} to ${gitIgnoreFileName} manually.`
			  );
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

async function appendConfigFileToGitIgnore(
	gitIgnoreFileName: string,
	configFileName: string
) {
	try {
		const gitIgnoreFileContent = await fse.readFile(gitIgnoreFileName);

		if (!gitIgnoreFileContent.includes(configFileName)) {
			await fse.appendFile(gitIgnoreFileName, `${configFileName}\n`);
		}

		return true;
	} catch (e) {
		return false;
	}
}
