#!/usr/bin/env node

import { Command, CommanderError } from 'commander';
import { install, init } from './commands';
import wrapCommand from './utils/wrap-command';
import { packageName } from './consts';

async function main() {
	const program = new Command();

	program
		.name(packageName)
		.description('A command line tool for linking packages');

	program.command('install').action(wrapCommand(install));
	program
		.command('init')
		.option(
			'-f, --force',
			'create a config file even if it already exists.'
		)
		.action(wrapCommand(init));

	program.exitOverride();

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
