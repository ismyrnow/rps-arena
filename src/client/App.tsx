import { useEffect, useState } from "react";

export default function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Retrieve player ID from local storage (or create one if it doesn't exist)
    let storedPlayerId = window.localStorage.getItem("rps_playerId");

    if (!storedPlayerId) {
      storedPlayerId = `player-${Math.random().toString(36).substr(2, 9)}`;
      window.localStorage.setItem("rps_playerId", storedPlayerId);
    }

    setPlayerId(storedPlayerId);

    // Set up native WebSocket
    const ws = new WebSocket(
      `ws://localhost:3000/ws?playerId=${storedPlayerId}`,
    );

    ws.onopen = () => {
      console.log("Connected to server");
      setIsConnected(true);
      console.log("Joining lobby as", storedPlayerId);
      ws.send(JSON.stringify({ type: "lobby:join", playerId: storedPlayerId }));
      console.log("Joined lobby, waiting for match...");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);
    };

    ws.onclose = () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
            Waiting for opponent...
          </h2>
          <p className="text-base-content/70 text-lg sm:text-xl mb-8 text-center">
            Looking for someone to battle with
          </p>
          <span className="loading loading-dots loading-lg"></span>
          {isConnected && (
            <p className="text-sm text-base-content/50 mt-4">
              Player ID: {playerId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
