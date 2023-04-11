import z from 'zod';

export default z.object({
	packages: z.record(z.string(), z.string()),
});
