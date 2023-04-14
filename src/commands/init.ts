import { logBlock, logInfo, logSuccess } from '../utils/logs';
import fse from 'fs-extra';
import { configFileName, packageName } from '../consts';
import { Config } from '../schemes/config';
import ConfigFileExistsError from '../errors/config-file-exists-error';

export default function init({ force }: { force: boolean }) {
	logInfo(`${packageName} init command is running...`);

	if (fse.pathExistsSync(configFileName) && !force) {
		throw new ConfigFileExistsError(
			`${packageName} config file already exists. Run '${packageName} init --force' to generate a new one.`
		);
	}

	const config: Config = {
		enabled: true,
		packages: [],
	};

	fse.writeJSONSync(configFileName, config, { spaces: 2 });

	// TODO: Add plink config file to .gitignore if exists, otherwise log a warning.

	logBlock(() => {
		logSuccess(`${packageName} config file was generated successfully.`);
	});
}
