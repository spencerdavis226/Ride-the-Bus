type TouchState = {
  startX: number;
  startY: number;
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
const keyboardTargetSelector = 'input, textarea, select';
const touchMoveCancelThreshold = 8;
const keyboardResetDelays = [0, 80, 180, 360];

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

function isKeyboardTarget(target: EventTarget | null) {
  return target instanceof Element && target.matches(keyboardTargetSelector);
}

export function startIOSPwaGuards() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !isIOSDevice()) return;

  const touchState: TouchState = { startX: 0, startY: 0, x: 0, y: 0 };
  const viewport = window.visualViewport;
  let stableViewportHeight = viewport?.height ?? window.innerHeight;
  let keyboardActive = false;
  let keyboardClosing = false;
  let lastViewportHeight = stableViewportHeight;
  let resetTimerIds: number[] = [];

  const prevent = (event: Event) => {
    event.preventDefault();
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    const x = touch?.clientX ?? 0;
    const y = touch?.clientY ?? 0;
    touchState.startX = x;
    touchState.startY = y;
    touchState.x = x;
    touchState.y = y;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      event.preventDefault();
      return;
    }

    const currentX = event.touches[0]?.clientX ?? touchState.x;
    const currentY = event.touches[0]?.clientY ?? touchState.y;
    const movedEnough =
      Math.abs(currentX - touchState.startX) > touchMoveCancelThreshold ||
      Math.abs(currentY - touchState.startY) > touchMoveCancelThreshold;

    if (!movedEnough) {
      touchState.x = currentX;
      touchState.y = currentY;
      return;
    }

    const scrollable = findScrollableElement(event.target);

    if (!scrollable || shouldBlockScrollableBounce(scrollable, currentX, currentY, touchState)) {
      event.preventDefault();
    }

    touchState.x = currentX;
    touchState.y = currentY;
  };

  const clearResetTimers = () => {
    resetTimerIds.forEach((timerId) => window.clearTimeout(timerId));
    resetTimerIds = [];
  };

  const resetRootScroll = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const scheduleKeyboardCloseReset = () => {
    keyboardClosing = true;
    clearResetTimers();
    resetTimerIds = keyboardResetDelays.map((delay) =>
      window.setTimeout(() => {
        resetRootScroll();
        if (delay === keyboardResetDelays[keyboardResetDelays.length - 1]) {
          keyboardClosing = false;
          stableViewportHeight = viewport?.height ?? window.innerHeight;
          resetTimerIds = [];
        }
      }, delay)
    );
  };

  const onFocusIn = (event: FocusEvent) => {
    if (!isKeyboardTarget(event.target)) return;
    stableViewportHeight = viewport?.height ?? window.innerHeight;
    keyboardActive = true;
    keyboardClosing = false;
    clearResetTimers();
  };

  const onFocusOut = (event: FocusEvent) => {
    if (!isKeyboardTarget(event.target)) return;
    keyboardActive = false;
    scheduleKeyboardCloseReset();
  };

  const onViewportChange = () => {
    const nextHeight = viewport?.height ?? window.innerHeight;
    const viewportRecovered =
      keyboardActive === false &&
      nextHeight >= stableViewportHeight - 12 &&
      lastViewportHeight < nextHeight;

    lastViewportHeight = nextHeight;

    if (keyboardClosing || viewportRecovered) {
      scheduleKeyboardCloseReset();
      return;
    }

    if (!keyboardActive) stableViewportHeight = nextHeight;
  };

  document.addEventListener('gesturestart', prevent, { passive: false });
  document.addEventListener('gesturechange', prevent, { passive: false });
  document.addEventListener('gestureend', prevent, { passive: false });
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  viewport?.addEventListener('resize', onViewportChange);
  viewport?.addEventListener('scroll', onViewportChange);
}
