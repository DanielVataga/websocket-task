export type WorkerStats = {
  wait_time: number;
  workers: number;
  waiting: number;
  idle: number;
  time_to_return: number;
  recently_blocked_keys: [string, number, string][];
  top_keys: [string, number][];
};

export type RegionBody = {
  status: string;
  region: string;
  roles: string[];
  results: {
    services: {
      redis: boolean;
      database: boolean;
      [key: string]: boolean;
    };
    stats: {
      servers_count: number;
      online: number;
      session: number;
      server: {
        cpus: number;
        active_connections: number;
        wait_time: number;
        workers: [string, WorkerStats][];
        cpu_load: number;
        timers: number;
      };
    };
  };
  strict: boolean;
  server_issue: string | null;
  version: string;
};
