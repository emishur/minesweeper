//distinguished between single and double click

import { MouseEventHandler, TouchEventHandler, useRef } from "react";

export type Action = () => void;
export const useClickHandler = (
  onClick: Action,
  onDoubleClick: Action,
  msDelay: number = 200
): Action => {
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

export type ClickSettings = {
  onClick?: Action;
  onDoubleClick?: Action;
  onContextMenu: Action;
  msDoubleClickDelay?: number;
  msContextMenuDelay?: number;
};

type DefaultContextHandlers = {
  onContextMenu: MouseEventHandler;
};
type IosContextHandlers = {
  onTouchStart: TouchEventHandler;
  onTouchEnd: TouchEventHandler;
};
type ContextHandlers = DefaultContextHandlers | IosContextHandlers;

export type ClickEventHandlers = {
  onClick?: MouseEventHandler;
} & ContextHandlers;

const EmptyAction: Action = () => {};

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export const useClickActionsHandler = (
  settings: ClickSettings
): ClickEventHandlers => {
  const clickHandler = useClickHandler(
    settings.onClick || EmptyAction,
    settings.onDoubleClick || EmptyAction,
    settings.msDoubleClickDelay
  );

  const ctxCustomHandlers = useCustomContextMenu(
    settings.onContextMenu,
    settings.msContextMenuDelay
  );
  const ctxHandlers: ContextHandlers = isIOS
    ? {
        onTouchStart: () => ctxCustomHandlers.onTouchStart(),
        onTouchEnd: () => ctxCustomHandlers.onTouchEnd(),
      }
    : {
        onContextMenu: (e) => {
          e.preventDefault();
          settings.onContextMenu();
        },
      };
  const onClickHandler: { onClick?: MouseEventHandler } =
    !settings.onClick && !settings.onDoubleClick
      ? {} //only context menu action, no need to handle click events
      : isIOS
      ? {
          onClick: (e) => {
            e.preventDefault();
            if (!ctxCustomHandlers.consumed()) clickHandler();
          },
        }
      : {
          onClick: (e) => {
            e.preventDefault();
            clickHandler();
          },
        };
  return { ...ctxHandlers, ...onClickHandler };
};

const useCustomContextMenu = (
  onContext: Action,
  msDelay = 500
): {
  consumed: () => boolean;
  onTouchStart: Action;
  onTouchEnd: Action;
} => {
  let timerId: number | null = null;
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
