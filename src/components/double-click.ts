//distinguished between single and double click

export type OnClick = () => void;
export const useClickHandler = (
  onClick: OnClick,
  onDoubleClick: OnClick,
  msDelay: number = 200
): OnClick => {
  let singleClick: boolean = false;

  const onTimeout = () => {
    if (singleClick) {
      singleClick = false;
      onClick();
    }
  };

  return () => {
    if (singleClick) {
      singleClick = false;
      onDoubleClick();
    } else {
      singleClick = true;
      setTimeout(onTimeout, msDelay);
    }
  };
};

export type CancellableAction = (cancel: () => void) => void;

export const useCustomContextMenu = (
  onContext: OnClick,
  msDelay = 500
): { onTouchStart: OnClick; onTouchEnd: CancellableAction } => {
  let timerId: number | null = null;
  let suppressTouchEnd = false;
  const onTouchStart = () => {
    suppressTouchEnd = false;
    timerId = setTimeout(() => {
      timerId = null;
      suppressTouchEnd = true;
      onContext();
    }, msDelay);
  };
  const onTouchEnd = (cancel: () => void) => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (suppressTouchEnd) {
      suppressTouchEnd = false;
      cancel();
    }
  };
  return { onTouchStart, onTouchEnd };
};
