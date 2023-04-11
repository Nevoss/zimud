import fse from 'fs-extra';
import {
	configFileName,
	packageJsonFileName,
	packageJsonPlinkTmpFileName,
} from '../consts';
import { configScheme } from '../schemes';

export default async function preInstall() {
	const config = configScheme.parse(await fse.readJSON(configFileName));

	const pkgBuffer = await fse.readFile(packageJsonFileName);

	await fse.outputFile(packageJsonPlinkTmpFileName, pkgBuffer);

	const pkg = JSON.parse(pkgBuffer.toString());

	const packagesKeys = [
		'dependencies',
		'devDependencies',
		'peerDependencies',
	];

	for (const [name, overridePath] of Object.entries(config.packages)) {
		for (const key of packagesKeys) {
			if (pkg[key]?.[name]) {
				pkg[key][name] = overridePath;
			}
		}
	}

	await fse.outputJson(packageJsonFileName, pkg, { spaces: 2 });
}
