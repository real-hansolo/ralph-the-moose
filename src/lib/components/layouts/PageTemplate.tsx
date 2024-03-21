import { twMerge } from "tailwind-merge";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";
import { IconNetworkBase, Menu, Toast, type ToastProps } from "..";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { type Signal } from "@preact/signals-react";

export const PageTemplate = ({
  children,
  toasts,
}: {
  children: React.ReactNode;
  toasts: Signal<ToastProps[]>;
}) => {
  useSignals();
  const menuOpenSignal = useSignal<boolean>(false);
  return (
    <div
      className={twMerge(
        "relative h-full min-h-screen w-screen",
        "flex w-full flex-col justify-between gap-12 self-stretch",
        "bg-base-colors/neutral-600",
        "box-border",
        "px-4 pb-6 pt-2",
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
        className="grid-col-3 xl:grid-col-2 grid items-center justify-center gap-[16px] xl:grid xl:divide-y"
      >
        {menuOpenSignal.value && <Menu />}
        {children}
      </div>
      <div className="flex flex-row items-center justify-center gap-[16px]">
        <PageFooter menuOpenSignal={menuOpenSignal} />
      </div>

      <div className="fixed bottom-4 right-4 z-50 ml-4 flex flex-col gap-3">
        {/* <Toast status="success" title="Toast Title" message="Toast message" />
        <Toast
          status="error"
          title="Wrong Network"
          message="please connect your wallet to the right network"
          isPermanent={true}
        /> */}
        {toasts.value.map((toast, index) => (
          <Toast
            key={index}
            status={toast.status}
            title={toast.title}
            message={toast.message}
            isPermanent={toast.isPermanent}
          />
        ))}
      </div>
    </div>
  );
};
