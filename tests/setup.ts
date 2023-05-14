import { vol } from 'memfs';

jest.mock('fs', () => ({
	...jest.requireActual('memfs'),
	// fs-extra uses `realpath.native` which is not implemented in memfs.
	realpath: {
		...jest.requireActual('memfs').realpath,
		native: jest.fn(),
	},
}));

jest.mock('../src/utils/logs', () => ({
	logError: jest.fn(),
	logSuccess: jest.fn(),
	logInfo: jest.fn(),
	logWarn: jest.fn(),
	log: jest.fn(),
	spinner: jest.fn((title, callback) => callback()),
}));

beforeEach(() => {
	vol.reset();

	jest.clearAllMocks();
});
