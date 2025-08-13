import type { RegionBody } from "./region";

export type PollResult = {
  ok: boolean;
  status?: number;
  body?: RegionBody;
  error?: string;
  fetchedAt: string;
};

export type Snapshot = {
  timestamp: string;
  regions: Record<string, PollResult>;
  __changed?: Record<string, boolean>;
};
