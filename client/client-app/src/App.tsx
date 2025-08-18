import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Snapshot } from "./types/snapshot";

import CardList from "./components/CardList";
import WorkersTable from "./components/WorkersTable";

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws = new WebSocket(
      process.env.REACT_APP_WS_URL || "ws://localhost:8080"
    );

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

    ws.onerror = () => {
      console.error("WebSocket error, trying localhost...");
      if (process.env.REACT_APP_WS_URL) {
        ws.close();
        ws = new WebSocket("ws://localhost:8080");

        ws.onopen = () => setConnected(true);
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "snapshot") {
              console.log("Received snapshot(localhost):", msg.data);
              setSnapshot(msg.data);
            }
          } catch (err) {
            console.error("Invalid message", err);
          }
        };
        ws.onclose = () => setConnected(false);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const regionEntries = snapshot ? Object.entries(snapshot.regions) : [];

  return (
    <div className="bg-background text-foreground min-h-screen space-y-4 p-4 overflow-x-hidden">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">WebSocket Snapshot Viewer</h1>
        <p className="text-muted-foreground">
          {connected ? "Connected to WebSocket server" : "Disconnected"}
        </p>
      </div>
      {snapshot ? (
        <Tabs defaultValue={regionEntries[0]?.[0]} className="w-full">
          <div className="overflow-x-auto">
            <TabsList>
              {regionEntries.map(([region]) => (
                <TabsTrigger key={region} value={region}>
                  {region}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {regionEntries.map(([region, result]) => (
            <TabsContent key={region} value={region} className="space-y-4 mt-5">
              <CardList result={result} />
              <WorkersTable
                result={result.body?.results.stats.server.workers}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p className="text-muted-foreground">No snapshot received yet.</p>
      )}
    </div>
  );
}
