import React from "react";
import {
  Card,
  CardContent,
  CardContentWrapper,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { PollResult } from "../types/snapshot";

type Props = {
  result: PollResult;
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <CardContent>
    <CardDescription>{label}</CardDescription>
    <p>{value ?? "N/A"}</p>
  </CardContent>
);

export default function CardList({ result }: Props) {
  const body = result.body;

  const metaInfo = [
    {
      label: "Fetched At",
      value: new Date(result.fetchedAt).toLocaleTimeString(),
    },
    { label: "Status", value: result.status },
    { label: "Region", value: body?.region },
    { label: "Version", value: body?.version },
    { label: "Strict", value: String(body?.strict) },
    { label: "Server issue", value: body?.server_issue ?? "false" },
  ];

  const services = [
    { label: "Database", value: String(body?.results.services.database) },
    { label: "Redis", value: String(body?.results.services.redis) },
  ];

  const overallStats = [
    { label: "Servers count", value: body?.results.stats.servers_count },
    { label: "Online", value: body?.results.stats.online },
    { label: "Session", value: body?.results.stats.session },
  ];

  const serverInfo = [
    { label: "CPUs", value: body?.results.stats.server.cpus },
    {
      label: "Active Connections",
      value: body?.results.stats.server.active_connections,
    },
    { label: "Wait Time", value: body?.results.stats.server.wait_time },
    { label: "CPU Load", value: body?.results.stats.server.cpu_load },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meta & Status Info</CardTitle>
        </CardHeader>
        <CardContentWrapper>
          {metaInfo.map((item) => (
            <InfoItem key={item.label} {...item} />
          ))}
        </CardContentWrapper>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContentWrapper>
          {services.map((item) => (
            <InfoItem key={item.label} {...item} />
          ))}
        </CardContentWrapper>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Stats</CardTitle>
        </CardHeader>
        <CardContentWrapper>
          {overallStats.map((item) => (
            <InfoItem key={item.label} {...item} />
          ))}
        </CardContentWrapper>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server Info</CardTitle>
        </CardHeader>
        <CardContentWrapper>
          {serverInfo.map((item) => (
            <InfoItem key={item.label} {...item} />
          ))}
        </CardContentWrapper>
      </Card>
    </div>
  );
}
