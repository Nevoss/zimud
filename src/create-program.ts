import { Command } from 'commander';
import { packageName } from './consts';
import { install, init } from './commands';
import wrapCommand from './utils/wrap-command';

export function createProgram() {
	const program = new Command();

	program
		.name(packageName)
		.description('A command line tool for linking packages');

	program
		.command('install')
		.option(
			'--dry-run',
			'run the command without actually installing the packages, just print the packages that will be installed.'
		)
		.action(wrapCommand(install));

	program
		.command('init')
		.option(
			'-f, --force',
			'create a config file even if it already exists.'
		)
		.action(wrapCommand(init));

	program.exitOverride();

	return program;
}
