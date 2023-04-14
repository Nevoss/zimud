import { CommanderError } from 'commander';

export default class InvalidConfigError extends CommanderError {
	constructor(message: string) {
		super(1, 'invalid.config', message);
	}
}
