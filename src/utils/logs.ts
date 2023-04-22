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
export async function spinner<T>(
	title: string,
	callback?: () => T
): Promise<T> {
	let i = 0;

	const id = setInterval(() => {
		process.stderr.write(` ${'⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[i++ % 10]} ${title}\r`);
	}, 100);

	let result: T;

	try {
		result = await callback!();
	} finally {
		clearInterval(id);

		process.stderr.write(' '.repeat(process.stdout.columns - 1) + '\r');
	}

	return result;
}
