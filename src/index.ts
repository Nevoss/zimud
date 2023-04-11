#!/usr/bin/env node

import { Command } from 'commander';
import fse from 'fs-extra';
import z from 'zod';

const program = new Command();

const configSchema = z.object({
	packages: z.record(z.string(), z.string()),
});

program
	.name('plink')
	.version('0.1.0')
	.description('A command line tool for linking packages');

program.command('pre-install').action(async () => {
	const config = configSchema.parse(await fse.readJSON('.plink.json'));

	const pkgBuffer = await fse.readFile('package.json');

	await fse.outputFile('package-json.plink.tmp', pkgBuffer);

	const pkg = JSON.parse(pkgBuffer.toString());

	const packagesKeys = [
		'dependencies',
		'devDependencies',
		'peerDependencies',
	];

	for (const [name, overridePath] of Object.entries(config.packages)) {
		for (const key of packagesKeys) {
			if (pkg[key]?.[name]) {
				pkg[key][name] = overridePath;
			}
		}
	}

	await fse.outputJson('package.json', pkg, { spaces: 2 });
});

program.command('post-install').action(async () => {
	const pkgBuffer = await fse.readFile('package-json.plink.tmp');

	await fse.outputFile('package.json', pkgBuffer);

	await fse.remove('package-json.plink.tmp');
});

program.parseAsync();
