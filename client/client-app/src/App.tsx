import React, { useEffect, useState } from "react";

type PollResult = {
  ok: boolean;
  status?: number;
  body?: any;
  error?: string;
  fetchedAt: string;
};

type Snapshot = {
  timestamp: string;
  regions: Record<string, PollResult>;
  __changed?: Record<string, boolean>;
};

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "snapshot") {
          console.log("Received snapshot:", msg.data);

          setSnapshot(msg.data);
        }
      } catch (err) {
        console.error("Invalid message", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="App">
      <div className="box">
        <h1>Hello world</h1>
      </div>
    </div>
  );
}
