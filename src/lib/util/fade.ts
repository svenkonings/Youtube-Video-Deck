export function fade(node: HTMLElement, visible: boolean): {update: (visible: boolean) => void; destroy: () => void} {
  const transitionEnd = () => {
    if (node.classList.contains("fadeOut")) {
      node.classList.add("hidden");
    }
  };
  node.addEventListener("transitionend", transitionEnd);

  const update = (visible: boolean) => {
    if (visible) {
      node.classList.remove("hidden");
      setTimeout(() => node.classList.replace("fadeOut", "fadeIn"));
    } else {
      node.classList.replace("fadeIn", "fadeOut");
    }
  };

  const destroy = () => {
    node.removeEventListener("transitionend", transitionEnd);
  };

  update(visible);
  return {update, destroy};
}
