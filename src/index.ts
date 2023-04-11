#!/usr/bin/env node

import { Command } from 'commander';
import { preInstall, postInstall } from './commands';

const program = new Command();

program
	.name('plink')
	.version('0.1.0')
	.description('A command line tool for linking packages');

program.command('pre-install').action(preInstall);
program.command('post-install').action(postInstall);

program.parseAsync();
