import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Snapshot } from "./types/snapshot";

import CardList from "./components/CardList";
import WorkersTable from "./components/WorkersTable";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

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

  const regionEntries = snapshot ? Object.entries(snapshot.regions) : [];

  return (
    <div className="bg-background text-foreground min-h-screen space-y-4 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">WebSocket Snapshot Viewer</h1>
        <p className="text-muted-foreground">
          {connected ? "Connected to WebSocket server" : "Disconnected"}
        </p>
      </div>
      {snapshot ? (
        <Tabs defaultValue={regionEntries[0]?.[0]} className="w-full">
          <TabsList className="overflow-x-auto">
            {regionEntries.map(([region]) => (
              <TabsTrigger key={region} value={region}>
                {region}
              </TabsTrigger>
            ))}
          </TabsList>

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
