import chalk from 'chalk';

export function logError(message: string) {
	console.error(` ${chalk.red('✖')} ${message}`);
}

export function logSuccess(message: string) {
	console.log(` ${chalk.green('✔')} ${message}`);
}

export function logInfo(message: string) {
	console.log(` ${chalk.blue('ℹ')} ${message}`);
}

export function logWarn(message: string) {
	console.warn(` ${chalk.yellow('⚠')} ${message}`);
}

export function log(message: string) {
	console.log(message);
}

export function logBlock(fn: () => void) {
	log('');
	fn();
}
