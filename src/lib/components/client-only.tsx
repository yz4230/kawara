import { noop } from "es-toolkit";
import { useSyncExternalStore, type PropsWithChildren, type ReactNode } from "react";

export default function ClientOnly(props: PropsWithChildren<{ fallback?: ReactNode }>) {
  const isClient = useSyncExternalStore(
    () => noop,
    () => true,
    () => false,
  );

  return isClient ? props.children : (props.fallback ?? null);
}
