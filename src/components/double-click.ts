//distinguished between single and double click

import { useRef } from "react";

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
  consumed: () => boolean;
  onTouchStart: OnClick;
  onTouchEnd: OnClick;
} => {
  let timerId: number | null = null;
  useRef(false);
  let consumedRef = useRef(false);
  const onTouchStart = () => {
    consumedRef.current = false;
    timerId = setTimeout(() => {
      timerId = null;
      consumedRef.current = true;
      onContext();
    }, msDelay);
  };
  const onTouchEnd = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  return { consumed: () => consumedRef.current, onTouchStart, onTouchEnd };
};
