import { log, logError } from './logs';
import { CommanderError } from 'commander';

export default function wrapCommand<TArgs extends unknown[]>(
	command: (...args: TArgs) => void
) {
	return async (...args: TArgs) => {
		log('');

		try {
			await command(...args);

			log('');
		} catch (error) {
			if (error instanceof CommanderError) {
				logError(error.message);
				log('');
			}

			throw error;
		}
	};
}
