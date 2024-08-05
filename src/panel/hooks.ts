import { useCallback, useEffect, useRef } from "react";

export const useAutoScrollUp = (container: HTMLElement | null) => {
  const isScrolledToBottomRef = useRef<boolean>(true);

  const scrollToBottom = useCallback(() => {
    if (container && isScrolledToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [container]);

  const handleScroll = useCallback(() => {
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledToBottom =
        Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
      isScrolledToBottomRef.current = isScrolledToBottom;
    }
  }, [container]);

  useEffect(() => {
    if (container) {
      container.addEventListener("scroll", handleScroll);
      const observer = new MutationObserver(scrollToBottom);
      observer.observe(container, { childList: true, subtree: true });
      return () => {
        container.removeEventListener("scroll", handleScroll);
        observer.disconnect();
      };
    }
  }, [container, handleScroll, scrollToBottom]);
};
