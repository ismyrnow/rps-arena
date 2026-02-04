type StatusHandler = (
  status: "connecting" | "lobby" | "matched" | "abandoned",
) => void;
type MessageHandler = (data: any) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private playerId: string = "";
  private statusHandler: StatusHandler | null = null;
  private messageHandler: MessageHandler | null = null;
  private isConnected = false;

  connect(
    playerId: string,
    url: string,
    onStatus: StatusHandler,
    onMessage: MessageHandler,
  ) {
    console.log("Connecting to WebSocket:", url);

    if (this.ws && this.playerId === playerId) {
      // Either connecting or already connected with the same playerId, do nothing
      console.log("WebSocket already connected for player:", playerId);
      return;
    }

    this.playerId = playerId;
    this.statusHandler = onStatus;
    this.messageHandler = onMessage;

    this.ws = new WebSocket(url);
    this.statusHandler?.("connecting");

    this.ws.onopen = () => {
      console.log("WebSocket connection opened for player:", playerId);
      this.isConnected = true;
      this.statusHandler?.("lobby");
      this.send({ type: "lobby:join", playerId });
    };

    this.ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      this.messageHandler?.(event.data);
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed for player:", playerId);
      this.isConnected = false;
      this.statusHandler?.("connecting");
    };

    this.ws.onerror = () => {
      console.error("WebSocket error for player:", playerId);
      this.isConnected = false;
      this.statusHandler?.("connecting");
    };
  }

  send(data: any) {
    if (this.ws && this.isConnected) {
      this.ws.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  close() {
    if (this.isConnected) {
      this.ws?.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

export const wsService = new WebSocketService();
