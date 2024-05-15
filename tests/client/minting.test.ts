import "reflect-metadata"
import "react/jsx-runtime"
import { signal } from "@preact/signals-react"
import { describe, it, expect, vi, afterEach,  } from "vitest"
import type { TWallet } from "~/lib/core/entity/models"
import type { TSignal } from "~/lib/core/entity/signals"
import type { TMintingViewModel } from "~/lib/core/view-models/minting-view-model"
import { clientContainer } from "~/lib/infrastructure/config/ioc/container"
import { CONTROLLER } from "~/lib/infrastructure/config/ioc/symbols"
import { BASE_SEPOLIA } from "~/lib/infrastructure/config/network-config"
import type MintingController from "~/lib/infrastructure/controllers/minting-controller"
import type { TMintingControllerParameters } from "~/lib/infrastructure/controllers/minting-controller"

describe("Minting", () => {
    afterEach(() => {
        
    })
    it("should mint 10 PR", () => {
        // const controller = clientContainer.get<MintingController>(CONTROLLER.MINTING_CONTROLLER)
        // const network = BASE_SEPOLIA
        // const wallet: TWallet = {
        //     name: "metamask",
        //     id: "io.metamask",
        //     provider: "thirdweb",
        //     activeAccount: "0x1234567890",
        //     availableAccounts: ["0x1234567890"],
        //     activeNetwork: network,
        // }
        // const response: TSignal<TMintingViewModel> = {
        //     name: "MintingViewModel",
        //     description: "Signal for minting view model",
        //     value: signal<TMintingViewModel>({
        //         status: "in-progress",
        //         message: "Minting successful",
        //         amount: 10,
        //         indexerBlockNumber: 0,
        //     }),
        // }
            
        // const parameters: TMintingControllerParameters = {
        //     wallet: wallet,
        //     network: network,
        //     amount: 10,
        //     response: response
        // }
        // const result = controller.execute(parameters)
        expect(1).toBeUndefined()
    })

})