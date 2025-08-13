import WebSocket, { WebSocketServer } from 'ws';
import axios from 'axios';
import type { Snapshot, PollResult } from './types/snapshot';
import dotenv from 'dotenv';
dotenv.config();

type RegionKey = 'us-east' | 'eu-west' | 'eu-central' | 'us-west' | 'sa-east' | 'ap-southeast';

const REGION_HOSTS: Record<RegionKey, string> = {
  'us-east': 'data--us-east.upscope.io',
  'eu-west': 'data--eu-west.upscope.io',
  'eu-central': 'data--eu-central.upscope.io',
  'us-west': 'data--us-west.upscope.io',
  'sa-east': 'data--sa-east.upscope.io',
  'ap-southeast': 'data--ap-southeast.upscope.io',
};

const POLL_PATH = '/status?stats=1';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 30000);
const WS_PORT = Number(process.env.WS_PORT ?? 8080);

function makeUrl(host: string) {
  return `https://${host}${POLL_PATH}`;
}

async function pollEndpoint(host: string): Promise<PollResult> {
  const url = makeUrl(host);
  const fetchedAt = new Date().toISOString();
  try {
    const res = await axios.get(url, { timeout: 5000 });
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      body: res.data,
      fetchedAt,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: String(err?.message ?? err),
      fetchedAt,
    };
  }
}

function createEmptySnapshot(): Snapshot {
  return {
    timestamp: new Date().toISOString(),
    regions: {},
  };
}

function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function pollAll(previous?: Snapshot): Promise<Snapshot> {
  const snapshot: Snapshot = createEmptySnapshot();
  const regionKeys = Object.keys(REGION_HOSTS) as RegionKey[];
  await Promise.all(
    regionKeys.map(async (r) => {
      const host = REGION_HOSTS[r];
      const result = await pollEndpoint(host);
      snapshot.regions[r] = result;
    }),
  );
  snapshot.timestamp = new Date().toISOString();

  if (previous) {
    const changed: Record<string, boolean> = {};
    for (const k of Object.keys(snapshot.regions)) {
      changed[k] = !deepEqual(snapshot.regions[k], previous.regions[k]);
    }
    (snapshot as any).__changed = changed;
  }
  return snapshot;
}

const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server listening on ws://localhost:${WS_PORT}`);

let lastSnapshot: Snapshot | undefined = undefined;

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  if (lastSnapshot) {
    ws.send(JSON.stringify({ type: 'snapshot', data: lastSnapshot }));
  }

  ws.on('message', (message: string) => {
    try {
      const m = message.toString();
      if (m === 'request_snapshot' && lastSnapshot) {
        ws.send(JSON.stringify({ type: 'snapshot', data: lastSnapshot }));
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

async function startPolling() {
  try {
    lastSnapshot = await pollAll();
    broadcast({ type: 'snapshot', data: lastSnapshot });
  } catch (err) {
    console.error('Initial poll failed', err);
  }

  setInterval(async () => {
    try {
      const snap = await pollAll(lastSnapshot);
      const changed = (snap as any).__changed;
      const anyChanged = changed ? Object.values(changed).some(Boolean) : true;
      lastSnapshot = snap;
      broadcast({ type: 'snapshot', data: snap, anyChanged });
    } catch (err) {
      console.error('Polling error', err);
    }
  }, POLL_INTERVAL_MS);
}

function broadcast(obj: any) {
  const str = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(str);
    }
  });
}

startPolling().catch((e) => console.error(e));