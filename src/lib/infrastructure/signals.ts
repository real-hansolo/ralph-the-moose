import { signal } from "@preact/signals-react";
import { ToastProps } from "../components";

/**
 * [Signal] Toasts: Store the toasts to be displayed on the screen.
 */
export const toasts = signal<ToastProps[]>([]);