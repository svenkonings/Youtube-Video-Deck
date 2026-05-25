import type {Attachment} from "svelte/attachments";

export function fade(getVisible: () => boolean): Attachment<Element> {
  return (node: Element) => {
    const transitionEnd = () => {
      if (node.classList.contains("fadeOut")) {
        node.classList.add("hidden");
      }
    };
    node.addEventListener("transitionend", transitionEnd);

    $effect(() => {
      if (getVisible()) {
        node.classList.remove("hidden");
        setTimeout(() => {
          node.classList.remove("fadeOut");
          node.classList.add("fadeIn");
        });
      } else {
        node.classList.remove("fadeIn");
        node.classList.add("fadeOut");
      }
    });

    return () => node.removeEventListener("transitionend", transitionEnd);
  };
}
