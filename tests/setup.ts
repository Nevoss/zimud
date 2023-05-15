import { vol } from 'memfs';
import { addLog as mockAddLog, resetLog } from './test-utils/log-mock';

jest.mock('fs', () => ({
	...jest.requireActual('memfs'),
	// fs-extra uses `realpath.native` which is not implemented in memfs.
	realpath: {
		...jest.requireActual('memfs').realpath,
		native: jest.fn(),
	},
}));

jest.mock('../src/utils/logs', () => ({
	logError: jest.fn(mockAddLog),
	logSuccess: jest.fn(mockAddLog),
	logInfo: jest.fn(mockAddLog),
	logWarn: jest.fn(mockAddLog),
	log: jest.fn(mockAddLog),
	spinner: jest.fn((title, callback) => callback()),
}));

const originalCwd = process.cwd();

beforeAll(() => {
	process.chdir('/');
});

afterAll(() => {
	process.chdir(originalCwd);
});

beforeEach(() => {
	vol.reset();

	jest.clearAllMocks();

	resetLog();
});
