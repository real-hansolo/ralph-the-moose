import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { serverContainer } from "~/lib/infrastructure/config/ioc/container";
import type RPCGatewayOutputPort from "~/lib/core/ports/secondary/rpc-gateway-output-port";
import { GATEWAYS } from "~/lib/infrastructure/config/ioc/symbols";

export const rpcRouter = createTRPCRouter({
  getTransaction: publicProcedure
    .input(
      z.object({
        networkId: z.number(),
        hash: z.string(),
      }),
    )
    .query(({ input }) => {
      const rpcGateway = serverContainer.get<RPCGatewayOutputPort>(
        GATEWAYS.RPC_GATEWAY,
      );
      return rpcGateway.getTransactionByHash(input.networkId, input.hash);
    }),
});
