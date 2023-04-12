import { log, logError, logInfo, logSuccess } from '../utils/logs';
import fse from 'fs-extra';
import { configFileName, packageName } from '../consts';
import { Config } from '../schemes/config';

export default function init({ force }: { force: boolean }) {
	log('');
	logInfo(`${packageName} init command is running...`);

	if (fse.pathExistsSync(configFileName) && !force) {
		logError(
			`${packageName} config file already exists. Run '${packageName} init --force' to generate a new one.`
		);
		log('');

		process.exit(1);
	}

	const config: Config = {
		enabled: true,
		packages: [],
	};

	fse.writeJSONSync(configFileName, config, { spaces: 2 });

	// TODO: Add plink config file to .gitignore if exists, otherwise log a warning.

	log('');
	logSuccess(`${packageName} config file was generated successfully.`);
	log('');
}
