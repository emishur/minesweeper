//distinguished between single and double click

import { MouseEventHandler, TouchEventHandler, useRef } from "react";

export type Action = () => void;
const EmptyAction: Action = () => {};

/**
 * Discriminates between single and double click actions.
 * @returns An event handler to use with a component `onClick` event.
 * @example
 * ```typescript
 *  const handler = useDoubleClickHandler(onClick, onDoubleClick);
 *  ...
 *  <div onClick={(e) => {
 *     e.preventDefault();
 *     handler();
 *   }}/>
 *  ...
 *  </div>
 * ```
 */
export const useDoubleClickHandler = (
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

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

/**
 * Provides support for a secondary action (`onContextMenu`), triggered by a
 * right-click on desktop or a tap-and-hold gesture on touch devices (including
 * iOS Safari).
 * If you need to handle both secondary action and single/double click events
 * together, use this hook instead of `useDoubleClickHandler`.
 * @returns An object containing the necessary event handlers to support
 * the required interactions.
 * @example
 * ```typescript
 * const handlers = useClickActionsHandler(...);
 * ...
 * <div {{...handlers}}>
 * ...
 * </div>
 * ```
 */
export const useClickActionsHandler = (
  settings: ClickSettings
): ClickEventHandlers => {
  const clickHandler = useDoubleClickHandler(
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
