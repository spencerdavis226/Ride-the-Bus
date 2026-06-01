import { X } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent, ReactNode, TransitionEvent as ReactTransitionEvent } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './IconButton';

const DRAWER_EXIT_MS = 260;
const DRAG_CLOSE_DISTANCE = 92;
const DRAG_CLOSE_VELOCITY = 0.55;

type DrawerProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  contentClassName?: string;
  contentMaxHeight?: string;
  onClose: () => void;
};

export function Drawer({ open, title, children, contentClassName = '', contentMaxHeight = '62dvh', onClose }: DrawerProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const drawerTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    lastY: number;
    lastTime: number;
  } | null>(null);
  const dragMoveListenerRef = useRef<((event: PointerEvent) => void) | null>(null);
  const dragEndListenerRef = useRef<((event: PointerEvent) => void) | null>(null);
  const [shouldRender, setShouldRender] = useState(open);
  const [drawerState, setDrawerState] = useState<'opening' | 'open' | 'closing'>(open ? 'opening' : 'open');

  const clearDrawerTimer = useCallback(() => {
    if (drawerTimerRef.current === null) return;
    window.clearTimeout(drawerTimerRef.current);
    drawerTimerRef.current = null;
  }, []);

  const detachDragListeners = useCallback(() => {
    if (dragMoveListenerRef.current) {
      window.removeEventListener('pointermove', dragMoveListenerRef.current);
      dragMoveListenerRef.current = null;
    }
    if (dragEndListenerRef.current) {
      window.removeEventListener('pointerup', dragEndListenerRef.current);
      window.removeEventListener('pointercancel', dragEndListenerRef.current);
      dragEndListenerRef.current = null;
    }
  }, []);

  const resetDragStyles = useCallback(() => {
    const sheet = sheetRef.current;
    dragRef.current = null;
    detachDragListeners();
    if (!sheet) return;
    sheet.classList.remove('is-dragging', 'is-settling');
    sheet.style.removeProperty('--drawer-drag-y');
  }, [detachDragListeners]);

  const requestClose = useCallback(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    dragRef.current = null;
    detachDragListeners();
    sheet?.classList.remove('is-dragging', 'is-settling');
    onClose();
  }, [detachDragListeners, onClose, open]);

  useEffect(() => {
    if (open) {
      clearDrawerTimer();
      setShouldRender(true);
      setDrawerState('opening');
      resetDragStyles();
      drawerTimerRef.current = window.setTimeout(() => {
        setDrawerState('open');
        drawerTimerRef.current = null;
      }, DRAWER_EXIT_MS);
      return clearDrawerTimer;
    }

    if (!shouldRender) return;

    setDrawerState('closing');
    drawerTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
      setDrawerState('open');
      resetDragStyles();
      drawerTimerRef.current = null;
    }, DRAWER_EXIT_MS);

    return clearDrawerTimer;
  }, [clearDrawerTimer, open, resetDragStyles, shouldRender]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const frame = window.requestAnimationFrame(() => {
      const focusable = sheetRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.cancelAnimationFrame(frame);
    };
  }, [open, requestClose]);

  useEffect(() => {
    return () => {
      clearDrawerTimer();
      detachDragListeners();
    };
  }, [clearDrawerTimer, detachDragListeners]);

  const updateDrag = useCallback((pointerId: number, clientY: number) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== pointerId) return;

    const dragY = Math.max(0, clientY - drag.startY);
    const now = performance.now();
    sheetRef.current?.style.setProperty('--drawer-drag-y', `${dragY}px`);
    drag.lastY = clientY;
    drag.lastTime = now;
  }, []);

  const endDrag = useCallback(
    (pointerId: number, clientY: number, target?: HTMLDivElement) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== pointerId) return;

      const sheet = sheetRef.current;
      const dragY = Math.max(0, clientY - drag.startY);
      const elapsed = Math.max(1, performance.now() - drag.lastTime);
      const velocity = (clientY - drag.lastY) / elapsed;
      const shouldClose = dragY >= DRAG_CLOSE_DISTANCE || velocity >= DRAG_CLOSE_VELOCITY;

      if (target?.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }

      dragRef.current = null;
      detachDragListeners();
      sheet?.classList.remove('is-dragging');

      if (shouldClose) {
        requestClose();
        return;
      }

      sheet?.classList.add('is-settling');
      window.requestAnimationFrame(() => {
        sheet?.style.setProperty('--drawer-drag-y', '0px');
      });
    },
    [detachDragListeners, requestClose]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!open || event.button !== 0) return;
      detachDragListeners();

      dragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastTime: performance.now(),
      };

      const sheet = sheetRef.current;
      sheet?.classList.remove('is-settling');
      sheet?.classList.add('is-dragging');
      sheet?.style.setProperty('--drawer-drag-y', '0px');
      event.currentTarget.setPointerCapture(event.pointerId);

      const handleWindowPointerMove = (pointerEvent: PointerEvent) => {
        updateDrag(pointerEvent.pointerId, pointerEvent.clientY);
      };
      const handleWindowPointerEnd = (pointerEvent: PointerEvent) => {
        endDrag(pointerEvent.pointerId, pointerEvent.clientY);
      };

      dragMoveListenerRef.current = handleWindowPointerMove;
      dragEndListenerRef.current = handleWindowPointerEnd;
      window.addEventListener('pointermove', handleWindowPointerMove);
      window.addEventListener('pointerup', handleWindowPointerEnd);
      window.addEventListener('pointercancel', handleWindowPointerEnd);
    },
    [detachDragListeners, endDrag, open, updateDrag]
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    updateDrag(event.pointerId, event.clientY);
  }, [updateDrag]);

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      endDrag(event.pointerId, event.clientY, event.currentTarget);
    },
    [endDrag]
  );

  const handleSheetTransitionEnd = useCallback((event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform') return;
    event.currentTarget.classList.remove('is-settling');
  }, []);

  if (!shouldRender) return null;

  const sheet = (
    <>
      <div
        className="drawer-backdrop fixed inset-0 z-[80] backdrop-blur-sm"
        data-state={drawerState}
        onClick={requestClose}
      />
      <div
        ref={sheetRef}
        className="drawer-sheet fixed inset-x-0 bottom-0 z-[80] overflow-hidden shadow-sheet"
        data-state={drawerState}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onTransitionEnd={handleSheetTransitionEnd}
      >
        <div
          className="drawer-grabber-zone flex justify-center pb-1 pt-3"
          aria-hidden="true"
          onPointerCancel={finishDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
        >
          <div className="drawer-grabber h-[5px] w-10 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 pt-1">
          <h2 id={titleId} className="text-lg font-bold text-[var(--rtb-text)]">
            {title}
          </h2>
          <IconButton label="Close" onClick={requestClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div
          className={`drawer-content overflow-y-auto px-5 ${contentClassName}`}
          style={{ maxHeight: contentMaxHeight, paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
        >
          {children}
        </div>
      </div>
    </>
  );

  if (typeof document === 'undefined') return sheet;
  return createPortal(sheet, document.body);
}
