import z from 'zod';

export default z.object({
	enabled: z.boolean(),
	packages: z.array(z.string()),
});
