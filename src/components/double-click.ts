//distinguished between single and double click

export type OnClick = () => void;
export const useClickHandler = (
  onClick: OnClick,
  onDoubleClick: OnClick,
  msDelay: number = 300
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
