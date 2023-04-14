import { CommanderError } from 'commander';

export default class ConfigFileExistsError extends CommanderError {
	constructor(message: string) {
		super(1, 'config.exists', message);
	}
}
