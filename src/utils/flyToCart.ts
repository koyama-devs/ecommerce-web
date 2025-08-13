export function flyToCart(sourceEl: HTMLImageElement, targetEl: HTMLElement) {
  const clone = sourceEl.cloneNode(true) as HTMLImageElement;
  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  clone.style.position = "fixed";
  clone.style.top = `${sourceRect.top}px`;
  clone.style.left = `${sourceRect.left}px`;
  clone.style.width = `${sourceRect.width}px`;
  clone.style.height = `${sourceRect.height}px`;
  clone.style.transition = "all 0.7s ease-in-out";
  clone.style.zIndex = "2000";
  clone.style.borderRadius = "8px";

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    clone.style.top = `${targetRect.top + targetRect.height / 2 - sourceRect.height / 2}px`;
    clone.style.left = `${targetRect.left + targetRect.width / 2 - sourceRect.width / 2}px`;
    clone.style.opacity = "0";
    clone.style.transform = "scale(0.2)";

     // Shake effect
    targetEl.classList.add("shake-cart");
    setTimeout(() => {
        targetEl.classList.remove("shake-cart");
    }, 500);
  });

  setTimeout(() => {
    document.body.removeChild(clone);
  }, 700);
}
