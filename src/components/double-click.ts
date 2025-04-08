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

export const useCustomContextMenu = (
  onContext: OnClick,
  msDelay = 500
): { onTouchStart: OnClick; onTouchEnd: OnClick } => {
  let timerId: number | null = null;
  const onTouchStart = () => {
    timerId = setTimeout(() => {
      timerId = null;
      onContext();
    }, msDelay);
  };
  const onTouchEnd = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  return { onTouchStart, onTouchEnd };
};
