type TouchState = {
  x: number;
  y: number;
};

type ScrollableInfo = {
  canScrollX: boolean;
  canScrollY: boolean;
  element: HTMLElement;
};

const scrollableSelector = [
  '.drawer-content',
  '.turn-rail',
  '.overflow-y-auto',
  '[data-scrollable="true"]',
].join(',');

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function findScrollableElement(target: EventTarget | null): ScrollableInfo | null {
  if (!(target instanceof Element)) return null;
  const candidate = target.closest<HTMLElement>(scrollableSelector);
  if (!candidate) return null;

  const style = window.getComputedStyle(candidate);
  const canScrollY = /(auto|scroll)/.test(style.overflowY) && candidate.scrollHeight > candidate.clientHeight;
  const canScrollX = /(auto|scroll)/.test(style.overflowX) && candidate.scrollWidth > candidate.clientWidth;

  return canScrollY || canScrollX ? { canScrollX, canScrollY, element: candidate } : null;
}

function shouldBlockScrollableBounce(scrollable: ScrollableInfo, currentX: number, currentY: number, previous: TouchState) {
  const deltaX = currentX - previous.x;
  const deltaY = currentY - previous.y;
  const movingHorizontally = Math.abs(deltaX) > Math.abs(deltaY);

  if (scrollable.canScrollX && movingHorizontally) {
    const atLeft = scrollable.element.scrollLeft <= 0;
    const atRight = scrollable.element.scrollLeft + scrollable.element.clientWidth >= scrollable.element.scrollWidth - 1;
    return (atLeft && deltaX > 0) || (atRight && deltaX < 0);
  }

  if (!scrollable.canScrollY) return true;

  const atTop = scrollable.element.scrollTop <= 0;
  const atBottom = scrollable.element.scrollTop + scrollable.element.clientHeight >= scrollable.element.scrollHeight - 1;

  return (atTop && deltaY > 0) || (atBottom && deltaY < 0);
}

export function startIOSPwaGuards() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !isIOSDevice()) return;

  const touchState: TouchState = { x: 0, y: 0 };

  const prevent = (event: Event) => {
    event.preventDefault();
  };

  const onTouchStart = (event: TouchEvent) => {
    touchState.x = event.touches[0]?.clientX ?? 0;
    touchState.y = event.touches[0]?.clientY ?? 0;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      event.preventDefault();
      return;
    }

    const currentX = event.touches[0]?.clientX ?? touchState.x;
    const currentY = event.touches[0]?.clientY ?? touchState.y;
    const scrollable = findScrollableElement(event.target);

    if (!scrollable || shouldBlockScrollableBounce(scrollable, currentX, currentY, touchState)) {
      event.preventDefault();
    }

    touchState.x = currentX;
    touchState.y = currentY;
  };

  document.addEventListener('gesturestart', prevent, { passive: false });
  document.addEventListener('gesturechange', prevent, { passive: false });
  document.addEventListener('gestureend', prevent, { passive: false });
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
}
