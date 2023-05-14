import path from 'path';
import { vol } from 'memfs';
import fse from 'fs-extra';
import { logSuccess, logWarn } from '../../utils/logs';
import { runCommand } from 'test-utils';

const baseDir = path.resolve(__dirname, '../../../');

describe('zimud init', () => {
	beforeEach(() => {
		vol.mkdirSync(baseDir, {
			recursive: true,
		});
	});

	it('should throw an error if config file already exists', () => {
		// Arrange.
		vol.writeFileSync(path.resolve(baseDir, '.zimud.json'), '');

		// Act & Assert.
		return expect(() => runCommand('zimud init')).rejects.toThrowError(
			'config file already exists'
		);
	});

	it('should forcefully create config file when passing `--force`', async () => {
		// Arrange.
		vol.writeFileSync(path.resolve(baseDir, '.zimud.json'), '');

		// Act.
		await runCommand('zimud init --force');

		// Assert.
		const configFileExists = await fse.pathExists(
			path.resolve(baseDir, '.zimud.json')
		);

		expect(configFileExists).toBe(true);
	});

	it('should create a config file and append to gitignore', async () => {
		// Arrange.
		vol.writeFileSync(
			path.resolve(baseDir, '.gitignore'),
			'existing-file.ts\n'
		);

		// Act.
		await runCommand('zimud init');

		// Assert.
		const configFileExists = await fse.pathExists(
			path.resolve(baseDir, '.zimud.json')
		);

		const gitIgnoreFileContent = vol
			.readFileSync(path.resolve(baseDir, '.gitignore'))
			.toString();

		expect(configFileExists).toBe(true);
		expect(gitIgnoreFileContent).toBe('existing-file.ts\n.zimud.json\n');

		expect(logSuccess).toHaveBeenCalledWith(
			'.zimud.json was generated successfully.'
		);

		expect(logSuccess).toHaveBeenCalledWith('.gitignore was updated.');
	});

	it("should not append to gitignore when it's already there", async () => {
		// Arrange.
		vol.writeFileSync(path.resolve(baseDir, '.gitignore'), '.zimud.json');

		// Act.
		await runCommand('zimud init');

		// Assert.
		const gitIgnoreFileContent = vol
			.readFileSync(path.resolve(baseDir, '.gitignore'))
			.toString();

		expect(gitIgnoreFileContent).toBe('.zimud.json');
	});

	it('should warn when there is no gitignore', async () => {
		// Act.
		await runCommand('zimud init');

		// Assert.
		expect(logWarn).toHaveBeenCalledWith(
			'Could not read .gitignore file. Please add .zimud.json to .gitignore manually.'
		);
	});
});
