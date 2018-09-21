/**
 * Open a WebSocket. Auto-reconnect if it closes.
 */
export function connect<T extends EventListener>(
  WSocket: { new (url: string): T },
  url: string,
  onOpen: (socket: T) => void
) {
  return open();

  function open() {
    const socket = new WSocket(url);

    socket.addEventListener('close', event => {
      const evt = <{ code?: number }>event;
      if (evt.code !== 1000) {
        reconnect();
      }
    });

    socket.addEventListener('open', event => {
      onOpen(socket);
    });

    return socket;
  }

  function reconnect() {
    setTimeout(() => {
      console.log('WebSocket reconnecting...');
      open();
    }, 3000);
  }
}

export interface EventListener {
  addEventListener(name: string, callback?: (event: object) => void): void;
}
