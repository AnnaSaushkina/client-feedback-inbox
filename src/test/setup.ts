// jsdom не реализует getBoundingClientRect и ResizeObserver.
// Мокаем оба, иначе компоненты с измерением размеров не рендерятся в тестах.

Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
  writable: true,
  value: () => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    bottom: 600,
    right: 800,
    x: 0,
    y: 0,
    toJSON: () => {},
  }),
});

class MockResizeObserver {
  private cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  observe(el: Element) {
    this.cb(
      [
        {
          contentRect: el.getBoundingClientRect(),
          target: el,
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver;
