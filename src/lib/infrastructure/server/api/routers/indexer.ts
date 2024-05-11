import { createTRPCRouter, publicProcedure } from "../trpc";


export const indexerRouter = createTRPCRouter({
    getLatestBlock: publicProcedure.query(() => {
    }),
});