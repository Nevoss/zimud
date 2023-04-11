import fse from 'fs-extra';
import { packageJsonFileName, packageJsonPlinkTmpFileName } from '../consts';

export default async function postInstall() {
	const pkgBuffer = await fse.readFile(packageJsonPlinkTmpFileName);

	await fse.outputFile(packageJsonFileName, pkgBuffer);

	await fse.remove(packageJsonPlinkTmpFileName);
}
