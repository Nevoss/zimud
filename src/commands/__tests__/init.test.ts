import path from 'path';
import { createProgram } from '../../create-program';
import { vol } from 'memfs';
import fse from 'fs-extra';
import { logSuccess, logWarn } from '../../utils/logs';

jest.mock('fs', () => ({
	...jest.requireActual('memfs'),
	// fs-extra uses `realpath.native` which is not implemented in memfs.
	realpath: {
		...jest.requireActual('memfs').realpath,
		native: jest.fn(),
	},
}));

jest.mock('../../utils/logs', () => ({
	logError: jest.fn(),
	logSuccess: jest.fn(),
	logInfo: jest.fn(),
	logWarn: jest.fn(),
	log: jest.fn(),
}));

const baseDir = path.resolve(__dirname, '../../../');

describe('zimud init', () => {
	beforeEach(() => {
		vol.reset();

		vol.mkdirSync(baseDir, {
			recursive: true,
		});
	});

	it('should throw an error if config file already exists', () => {
		// Arrange.
		const program = createProgram();

		vol.writeFileSync(path.resolve(baseDir, '.zimud.json'), '');

		// Act & Assert.
		return expect(() =>
			program.parseAsync(['node', 'zimud', 'init'])
		).rejects.toThrowError('config file already exists');
	});

	it('should forcefully create config file when passing `--force`', async () => {
		// Arrange.
		const program = createProgram();

		vol.writeFileSync(path.resolve(baseDir, '.zimud.json'), '');

		// Act.
		await program.parseAsync(['node', 'zimud', 'init', '--force']);

		// Assert.
		const configFileExists = await fse.pathExists(
			path.resolve(baseDir, '.zimud.json')
		);

		expect(configFileExists).toBe(true);
	});

	it('should create a config file and append to gitignore', async () => {
		// Arrange.
		const program = createProgram();

		vol.writeFileSync(
			path.resolve(baseDir, '.gitignore'),
			'existing-file.ts\n'
		);

		// Act.
		await program.parseAsync(['node', 'zimud', 'init']);

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

	it('should no append to gitignore when it already exist', async () => {
		// Arrange.
		const program = createProgram();

		vol.writeFileSync(path.resolve(baseDir, '.gitignore'), '.zimud.json');

		// Act.
		await program.parseAsync(['node', 'zimud', 'init']);

		// Assert.
		const gitIgnoreFileContent = vol
			.readFileSync(path.resolve(baseDir, '.gitignore'))
			.toString();

		expect(gitIgnoreFileContent).toBe('.zimud.json');
	});

	it('should warn when there is no gitignore', async () => {
		// Arrange.
		const program = createProgram();

		// Act.
		await program.parseAsync(['node', 'zimud', 'init']);

		// Assert.
		expect(logWarn).toHaveBeenCalledWith(
			'Could not read .gitignore file. Please add .zimud.json to .gitignore manually.'
		);
	});
});
