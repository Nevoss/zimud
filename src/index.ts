#!/usr/bin/env node

import { CommanderError } from 'commander';
import { createProgram } from './create-program';

async function main() {
	const program = createProgram();

	try {
		await program.parseAsync();
	} catch (e) {
		if (e instanceof CommanderError) {
			process.exit(e.exitCode);
		}

		throw e;
	}
}

main();
