import { Button } from "@/components/ui/button";
import * as Automerge from "@automerge/automerge";
import {
  AutomergeUrl,
  RepoMessage,
  SyncMessage,
} from "@automerge/automerge-repo";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { formatDuration } from "./utils";

export type DocHandleServerMetrics = {
  peers: string[];
  size: { numChanges: number; numOps: number };
};

export type DocHandleClientMetrics = {
  url: AutomergeUrl;
  state:
    | "idle"
    | "ready"
    | "loading"
    | "requesting"
    | "awaitingNetwork"
    | "unavailable"
    | "deleted";
  size: { numChanges: number; numOps: number };
  heads: Automerge.Heads;
  syncMessages: RepoMessageWithTimestamp<SyncMessage>[];
  lastSyncedTimestamp?: number;
};

export type DocHandleMetrics = Omit<DocHandleClientMetrics, "size"> & {
  size: {
    numChanges: {
      client: number;
      server?: number;
    };
    numOps: {
      client: number;
      server?: number;
    };
  };
  messages: RepoMessageWithTimestamp[];
  peers?: string[];
};

export const docHandleMetricsColumns: ColumnDef<DocHandleMetrics>[] = [
  {
    accessorKey: "url",
    header: () => <div className="px-2 py-1">Url</div>,
  },
  {
    accessorKey: "state",
    header: ({ column }) => {
      return (
        <Button
          className="px-2 py-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          State
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "numSyncMessages",
    accessorFn: ({ messages }) =>
      messages.filter(({ type }) => type === "sync").length,
    header: () => <div className="px-2 py-1">Sync messages</div>,
    cell: ({ row }) => {
      const value = parseInt(row.getValue("numSyncMessages"));
      return <div className="text-right">{value}</div>;
    },
  },
  {
    accessorKey: "lastSyncedTimestamp",
    header: ({ column }) => {
      return (
        <Button
          className="px-2 py-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last synced
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const timestamp = parseInt(row.getValue("lastSyncedTimestamp"));
      const duration = timestamp ? formatDuration(Date.now() - timestamp) : "-";
      return <div className="whitespace-nowrap text-right">{duration}</div>;
    },
  },
  {
    accessorKey: "numChanges",
    accessorFn: (metrics) => metrics.size.numChanges,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-2 py-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Changes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { client, server } = row.getValue<{
        client: number;
        server: number;
      }>("numChanges");

      return (
        <div className="text-right whitespace-nowrap">
          {client}
          {server !== undefined && client !== server ? ` / ${server}` : ""}
        </div>
      );
    },
  },
  {
    id: "numOps",
    accessorFn: (metrics) => metrics.size.numOps,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-2 py-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ops
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { client, server } = row.getValue<{
        client: number;
        server: number;
      }>("numOps");

      return (
        <div className="text-right whitespace-nowrap">
          {client}
          {server !== undefined && client !== server ? ` / ${server}` : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "peers",
    header: () => <div className="px-2 py-1">Peers</div>,
    cell: ({ row }) => {
      const peers = row.getValue<string[]>("peers");

      return (
        <div className="text-right whitespace-nowrap">
          {peers?.length ?? "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "heads",
    header: () => <div className="px-2 py-1">Heads</div>,
    cell: ({ row }) => {
      const heads = row.getValue<string[]>("heads");

      return (
        <div className="text-left whitespace-nowrap">
          {heads.map((head) => head.slice(0, 8)).join(", ")}
        </div>
      );
    },
  },
];

export type RepoMessageWithTimestamp<T extends RepoMessage = RepoMessage> =
  T & {
    timestamp: number;
  };

export const messageInfoColumns: ColumnDef<RepoMessageWithTimestamp>[] = [
  {
    accessorKey: "type",
    header: () => <div className="px-2 py-1">Type</div>,
  },
  {
    accessorKey: "senderId",
    header: () => <div className="px-2 py-1">Sender</div>,
  },
  {
    accessorKey: "targetId",
    header: () => <div className="px-2 py-1">Target</div>,
  },
  {
    accessorKey: "timestamp",
    header: () => <div className="px-2 py-1">Timestamp</div>,
  },
  {
    accessorKey: "documentId",
    header: () => <div className="px-2 py-1">Document ID</div>,
  },
];
