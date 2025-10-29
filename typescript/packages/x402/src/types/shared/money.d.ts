import { z } from "zod";
export declare const moneySchema: z.ZodPipeline<z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodNumber]>, z.ZodNumber>;
export type Money = z.input<typeof moneySchema>;
//# sourceMappingURL=money.d.ts.map