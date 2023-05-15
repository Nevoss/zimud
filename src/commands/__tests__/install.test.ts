import path from 'path';
import { vol } from 'memfs';
import { getLog, runCommand } from 'test-utils';
import { exec } from 'child_process';

jest.mock('child_process', () => ({
	exec: jest.fn((_, callback) => callback()),
}));

describe('zimud install', () => {
	it('should fail when there is no config file', async () => {
		// Act.
		await runCommand('zimud install');

		// Assert.
		expect(getLog()).toMatchSnapshot();
		expect(exec).not.toHaveBeenCalled();
	});

	it('should fail when config file is invalid', async () => {
		// Arrange.
		vol.writeFileSync('.zimud.json', '{"invalid": "schema"}');

		// Act & Assert.
		await expect(runCommand('zimud install')).rejects.toThrowError(
			'config file is invalid'
		);

		expect(exec).not.toHaveBeenCalled();
	});

	it('should fail when the pacakge is disabled', async () => {
		// Arrange.
		vol.writeFileSync('.zimud.json', '{"enabled": false, "packages": []}');

		// Act.
		await runCommand('zimud install');

		// Assert.
		expect(getLog()).toMatchSnapshot();
		expect(exec).not.toHaveBeenCalled();
	});

	it('should warn when there are invalid packages', async () => {
		// Arrange.
		vol.mkdirSync('invalid-package');

		vol.writeFileSync('invalid-package/package.json', 'not-a-json');

		vol.writeFileSync(
			'.zimud.json',
			'{"enabled": true, "packages": ["invalid-package"]}'
		);

		// Act.
		await runCommand('zimud install');

		// Assert.
		const normalizedLog = getLog()
			.replace(/\\/g, '/') // Windows path delimiters.
			.replace(/[A-Z]:/g, ''); // Windows drive letter.

		expect(normalizedLog).toMatchSnapshot();
		expect(exec).not.toHaveBeenCalled();
	});

	it('should not install the packages when passing `--dry-run`', async () => {
		// Arrange.
		vol.mkdirSync('valid-package');

		vol.writeFileSync(
			'valid-package/package.json',
			'{"name": "valid-package"}'
		);

		vol.writeFileSync(
			'.zimud.json',
			'{"enabled": true, "packages": ["valid-package"]}'
		);

		// Act.
		await runCommand('zimud install --dry-run');

		// Assert.
		expect(getLog()).toMatchSnapshot();
		expect(exec).not.toHaveBeenCalled();
	});

	it('should install the packages', async () => {
		// Arrange.
		const packagesDir = 'packages';
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
			'.zimud.json',
			'{"enabled": true, "packages": ["packages/*"]}'
		);

		// Mock hrtime.
		const originalHrtime = process.hrtime;

		(process.hrtime as () => [number, number]) = jest.fn(() => [0, 0]);

		// Act.
		await runCommand('zimud install');

		// Assert.
		expect(getLog()).toMatchSnapshot();

		const expectedPackages = packages
			.reverse() // glob reverses the order.
			.map((packageName) => path.resolve(packagesDir, packageName))
			.join(' ');

		expect(exec).toHaveBeenCalledTimes(1);

		expect(exec).toHaveBeenCalledWith(
			`npm install ${expectedPackages} --no-package-lock --no-save`,
			expect.any(Function)
		);

		// Cleanup.
		process.hrtime = originalHrtime;
	});
});
