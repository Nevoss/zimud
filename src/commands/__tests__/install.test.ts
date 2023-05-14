import path from 'path';
import { vol } from 'memfs';
import fse from 'fs-extra';
import { log, logInfo, logSuccess, logWarn } from '../../utils/logs';
import { runCommand } from 'test-utils';
import { exec } from 'child_process';

jest.mock('child_process', () => ({
	exec: jest.fn((_, callback) => callback()),
}));

const baseDir = path.resolve(__dirname, '../../../');

describe('zimud install', () => {
	beforeEach(() => {
		vol.mkdirSync(baseDir, {
			recursive: true,
		});
	});

	it('should fail when there is no config file', async () => {
		// Act.
		await runCommand('zimud install');

		// Assert.
		expect(logInfo).toHaveBeenCalledTimes(1);

		expect(logInfo).toHaveBeenCalledWith(
			expect.stringContaining('config file was not found')
		);

		expect(exec).not.toHaveBeenCalled();
	});

	it('should fail when config file is invalid', async () => {
		// Arrange.
		vol.writeFileSync(
			path.resolve(baseDir, '.zimud.json'),
			'{"invalid": "schema"}'
		);

		// Act & Assert.
		await expect(runCommand('zimud install')).rejects.toThrowError(
			'config file is invalid'
		);

		expect(exec).not.toHaveBeenCalled();
	});

	it('should fail when the pacakge is disabled', async () => {
		// Arrange.
		vol.writeFileSync(
			path.resolve(baseDir, '.zimud.json'),
			'{"enabled": false, "packages": []}'
		);

		// Act.
		await runCommand('zimud install');

		// Assert.
		expect(logInfo).toHaveBeenCalledTimes(1);

		expect(logInfo).toHaveBeenCalledWith(
			expect.stringContaining('zimud is disabled')
		);

		expect(exec).not.toHaveBeenCalled();
	});

	it('should warn when there are invalid packages', async () => {
		// Arrange.
		vol.mkdirSync(path.resolve(baseDir, 'invalid-package'));

		vol.writeFileSync(
			path.resolve(baseDir, 'invalid-package/package.json'),
			'not-a-json'
		);

		vol.writeFileSync(
			path.resolve(baseDir, '.zimud.json'),
			'{"enabled": true, "packages": ["invalid-package"]}'
		);

		// Act.
		await runCommand('zimud install');

		// Assert.
		expect(logWarn).toHaveBeenCalledTimes(2);

		expect(logWarn).toHaveBeenNthCalledWith(
			1,
			'No valid packages to install.'
		);

		expect(logWarn).toHaveBeenNthCalledWith(
			2,
			expect.stringContaining(
				'Some packages are not installed because they are invalid'
			)
		);

		expect(exec).not.toHaveBeenCalled();
	});

	it('should not install the packages when passing `--dry-run`', async () => {
		// Arrange.
		vol.mkdirSync(path.resolve(baseDir, 'valid-package'));

		vol.writeFileSync(
			path.resolve(baseDir, 'valid-package/package.json'),
			'{"name": "valid-package"}'
		);

		vol.writeFileSync(
			path.resolve(baseDir, '.zimud.json'),
			'{"enabled": true, "packages": ["valid-package"]}'
		);

		// Act.
		await runCommand('zimud install --dry-run');

		// Assert.
		expect(logSuccess).toHaveBeenCalledTimes(1);

		expect(logSuccess).toHaveBeenCalledWith(
			'The following packages would have been installed:'
		);

		expect(exec).not.toHaveBeenCalled();
	});

	it('should install the packages', async () => {
		// Arrange.
		const packagesDir = path.resolve(baseDir, 'packages');
		const packages = ['package-a', 'package-b'];

		packages.forEach((packageName) => {
			vol.mkdirSync(path.resolve(packagesDir, packageName), {
				recursive: true,
			});

			vol.writeFileSync(
				path.resolve(packagesDir, `${packageName}/package.json`),
				`{"name": "${packageName}"}`
			);
		});

		vol.writeFileSync(
			path.resolve(baseDir, '.zimud.json'),
			'{"enabled": true, "packages": ["packages/*"]}'
		);

		// Act.
		await runCommand('zimud install');

		// Assert.
		expect(logSuccess).toHaveBeenCalledTimes(1);

		expect(logSuccess).toHaveBeenCalledWith(
			expect.stringContaining(
				'successfully installed the following packages'
			)
		);

		expect(log).toHaveBeenCalledWith('   - package-a');
		expect(log).toHaveBeenCalledWith('   - package-b');

		const expectedPackages = packages
			.reverse() // glob reverses the order.
			.map((packageName) => path.resolve(packagesDir, packageName))
			.join(' ');

		expect(exec).toHaveBeenCalledTimes(1);

		expect(exec).toHaveBeenCalledWith(
			`npm install ${expectedPackages} --no-package-lock --no-save`,
			expect.any(Function)
		);
	});
});
