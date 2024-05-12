import { z } from "zod";

export const DTOSchemaFactory = <TSuccessData, TErrorData>(
  successDataSchema: z.Schema<TSuccessData>,
  errorTypes: z.Schema<TErrorData>,
) => {
  return z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: successDataSchema,
    }),
    z.object({
      success: z.literal(false),
      data: errorTypes,
    }),
  ]);
};

export type BaseDTO<TSuccessData, TErrorData> = z.infer<
  ReturnType<typeof DTOSchemaFactory<TSuccessData, TErrorData>>
>;

