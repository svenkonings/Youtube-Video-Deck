import * as focusTrap from "focus-trap";
import { tick } from "svelte";

export function trapFocus(
  node: HTMLElement,
  enabled: boolean,
): {
  update: (enabled: boolean) => void;
  destroy: () => void;
} {
  const trap = focusTrap.createFocusTrap(node, {
    checkCanFocusTrap: tick,
    checkCanReturnFocus: tick,
    initialFocus: false,
    allowOutsideClick: true,
    escapeDeactivates: false,
  });
  const update = (enabled: boolean) => (enabled ? trap.activate() : trap.deactivate());
  const destroy = () => trap.deactivate();
  update(enabled);
  return { update, destroy };
}
