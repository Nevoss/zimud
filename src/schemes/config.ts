import z from 'zod';

const schema = z
	.object({
		enabled: z.boolean().describe('Whether to link packages or not.'),
		packages: z
			.array(z.string())
			.describe('An array of glob patterns to match packages to link.'),
	})
	.describe('Config schema for plink.');

export type Config = z.infer<typeof schema>;
export default schema;