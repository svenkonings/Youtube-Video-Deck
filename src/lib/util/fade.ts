export type FadeParams = {
  visible: boolean;
  initial: boolean;
};

export function fade(
  node: HTMLElement,
  params: FadeParams
): {
  update: (params: FadeParams) => void;
  destroy: () => void;
} {
  const transitionEnd = () => {
    if (node.classList.contains("fadeOut")) {
      node.classList.add("hidden");
    }
  };
  node.addEventListener("transitionend", transitionEnd);

  if (params.initial) {
    node.classList.add("fadeIn");
  } else {
    node.classList.add("hidden");
    node.classList.add("fadeOut");
  }

  const update = (params: FadeParams) => {
    if (params.visible) {
      node.classList.remove("hidden");
      setTimeout(() => node.classList.replace("fadeOut", "fadeIn"));
    } else {
      node.classList.replace("fadeIn", "fadeOut");
    }
  };

  const destroy = () => {
    node.removeEventListener("transitionend", transitionEnd);
  };

  update(params);
  return { update, destroy };
}
