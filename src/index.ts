#!/usr/bin/env node

import { Command } from 'commander';
import { install, init } from './commands';

const program = new Command();

program
	.name('plink')
	.version('0.1.0')
	.description('A command line tool for linking packages');

program.command('install').action(install);
program.command('init').action(init);

program.parseAsync();
