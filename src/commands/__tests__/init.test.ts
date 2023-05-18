import { vol } from 'memfs';
import fse from 'fs-extra';
import { getLog, runCommand } from 'test-utils';

describe('zimud init', () => {
	it('should throw an error if config file already exists', () => {
		// Arrange.
		vol.writeFileSync('.zimud.json', '');

		// Act & Assert.
		return expect(() => runCommand('zimud init')).rejects.toThrowError(
			'config file already exists'
		);
	});

	it('should forcefully create config file when passing `--force`', async () => {
		// Arrange.
		vol.writeFileSync('.zimud.json', '');

		// Act.
		await runCommand('zimud init --force');

		// Assert.
		const configFileExists = await fse.pathExists('.zimud.json');

		expect(configFileExists).toBe(true);
	});

	it('should create a config file and append to gitignore', async () => {
		// Arrange.
		vol.writeFileSync('.gitignore', 'existing-file.ts\n');

		// Act.
		await runCommand('zimud init');

		// Assert.
		const configFileExists = await fse.pathExists('.zimud.json');

		const gitIgnoreFileContent = vol.readFileSync('.gitignore').toString();

		expect(configFileExists).toBe(true);
		expect(gitIgnoreFileContent).toBe('existing-file.ts\n.zimud.json\n');

		expect(getLog()).toMatchSnapshot();
	});

	it("should not append to gitignore when it's already there", async () => {
		// Arrange.
		vol.writeFileSync('.gitignore', '.zimud.json');

		// Act.
		await runCommand('zimud init');

		// Assert.
		const gitIgnoreFileContent = vol.readFileSync('.gitignore').toString();

		expect(gitIgnoreFileContent).toBe('.zimud.json');
	});

	it('should warn when there is no gitignore', async () => {
		// Act.
		await runCommand('zimud init');

		// Assert.
		expect(getLog()).toMatchSnapshot();
	});
});
