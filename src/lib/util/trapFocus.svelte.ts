import * as focusTrap from "focus-trap";
import {tick} from "svelte";
import type {Attachment} from "svelte/attachments";

export function trapFocus(getEnabled: () => boolean): Attachment<HTMLElement> {
  return (node: HTMLElement) => {
    const trap = focusTrap.createFocusTrap(node, {
      checkCanFocusTrap: tick,
      checkCanReturnFocus: tick,
      initialFocus: false,
      allowOutsideClick: true,
      escapeDeactivates: false,
    });
    $effect(() => {
      if (getEnabled()) {
        trap.activate();
      } else {
        trap.deactivate();
      }
    });
    return () => trap.deactivate();
  };
}
