import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { WorkerStats } from "../types/region";

type Props = {
  result: [string, WorkerStats][] | undefined;
};

export default function WorkersTable({ result }: Props) {
  if (!result || result.length === 0) {
    return <p className="text-sm text-gray-500">No worker data available.</p>;
  }

  return (
    <> 
      <h2 className="text-xl font-semibold mb-4">Workers Statistics</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Worker Name</TableHead>
            <TableHead>Wait Time (ms)</TableHead>
            <TableHead>Workers</TableHead>
            <TableHead>Waiting</TableHead>
            <TableHead>Idle</TableHead>
            <TableHead>Time to Return (ms)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.map(([name, stats]) => (
            <TableRow key={name}>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>{stats.wait_time}</TableCell>
              <TableCell>{stats.workers}</TableCell>
              <TableCell>{stats.waiting}</TableCell>
              <TableCell>{stats.idle}</TableCell>
              <TableCell>{stats.time_to_return}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
