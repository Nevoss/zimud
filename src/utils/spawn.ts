import { spawn as baseSpawn, SpawnOptions } from 'child_process';
import { promisify } from 'util';

type Spawn = (
	command: string,
	args: ReadonlyArray<string>,
	options?: SpawnOptions
) => Promise<{ stdout: string; stderr: string }>;

export default async function spawn(
	command: string,
	args: ReadonlyArray<string>,
	options: SpawnOptions
) {
	const promisifySpawn = promisify(baseSpawn) as Spawn;

	return promisifySpawn(command, args, options);
}
