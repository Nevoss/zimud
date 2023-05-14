import { createProgram } from '../src/create-program';

export function runCommand(command: string) {
	const argv = command.split(' ');

	return createProgram().parseAsync(['node', ...argv]);
}
