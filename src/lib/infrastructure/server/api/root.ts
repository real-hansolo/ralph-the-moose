import { postRouter } from "./routers/post";
import { rpcRouter } from "./routers/rpc";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  rpc: rpcRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
