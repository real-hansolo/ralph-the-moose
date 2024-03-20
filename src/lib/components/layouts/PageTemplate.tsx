import { twMerge } from "tailwind-merge";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";
import { IconNetworkBase, Menu, Toast } from "..";
import { useSignal, useSignals } from "@preact/signals-react/runtime";


export const PageTemplate = ({ children }: { children: React.ReactNode }) => {
  useSignals();
  const menuOpenSignal = useSignal<boolean>(false);
  return (
    <div
      className={twMerge(
        "w-screen h-full min-h-screen relative",
        "flex flex-col w-full self-stretch justify-between gap-12",
        "bg-base-colors/neutral-600",
        "box-border",
        "pt-2 px-4 pb-6",
        "overflow-x-hidden",
      )}
    >
        <PageHeader
          networks={[
            {
              name: "Base",
              chainId: 1,
              icon: <IconNetworkBase />,
            },
          ]}
          activeNetwork={{
            name: "Base",
            chainId: 1,
            icon: <IconNetworkBase />,
          }}
          onNetworkChange={() => {}}
          menuOpenSignal={menuOpenSignal}
        />
        <div
          id="content-container"
          className="grid grid-col-3 xl:grid xl:grid-col-2 xl:divide-y items-center justify-center gap-[16px]"
        >
          {menuOpenSignal.value && <Menu />}
          {children}
        </div>
        <div className="flex flex-row items-center justify-center gap-[16px]">
          <PageFooter menuOpenSignal={menuOpenSignal} />
        </div>

        <div className="fixed bottom-4 right-4 ml-4 flex flex-col gap-3 z-50">
          <Toast status="success" title="Toast Title" message="Toast message"/>
          <Toast status="error" title="Wrong Network" message="please connect your wallet to the right network" isPermanent={true}/>
        </div>
    </div>
  );
};
