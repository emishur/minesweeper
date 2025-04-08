//distinguished between single and double click

import { useState } from "react";

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
): {
  consumed: boolean;
  onTouchStart: OnClick;
  onTouchEnd: OnClick;
} => {
  let timerId: number | null = null;
  let [consumed, setConsumed] = useState(false);
  const onTouchStart = () => {
    setConsumed(false);
    timerId = setTimeout(() => {
      timerId = null;
      setConsumed(true);
      onContext();
    }, msDelay);
  };
  const onTouchEnd = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  return { consumed, onTouchStart, onTouchEnd };
};
