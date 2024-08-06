import { Button } from "@/components/ui/button";
import * as Automerge from "@automerge/automerge";
import { RepoMessage, SyncMessage } from "@automerge/automerge-repo";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { formatDuration } from "./utils";

export type DocHandleState = {
  url: string;
  state:
    | "idle"
    | "ready"
    | "loading"
    | "requesting"
    | "awaitingNetwork"
    | "unavailable"
    | "deleted";
  numberOfChanges: number;
  numberOfOps?: number;
  heads: Automerge.Heads;
  syncMessages: RepoMessageWithTimestamp<SyncMessage>[];
  lastSyncedTimestamp?: number;
};

export type DocHandleStateWithMessages = DocHandleState & {
  messages: RepoMessageWithTimestamp[];
};

export const docHandleStateColumns: ColumnDef<DocHandleStateWithMessages>[] = [
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
    id: "numberOfSyncMessages",
    accessorFn: ({ messages }) =>
      messages.filter(({ type }) => type === "sync").length,
    header: () => <div className="px-2 py-1">Sync messages</div>,
    cell: ({ row }) => {
      const value = parseInt(row.getValue("numberOfSyncMessages"));
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
    accessorKey: "numberOfChanges",
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
      const value = row.getValue<number>("numberOfChanges");
      return <div className="text-right">{value}</div>;
    },
  },
  {
    accessorKey: "numberOfOps",
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
      const value = row.getValue<number>("numberOfOps") ?? "-";
      return <div className="text-right">{value}</div>;
    },
  },
  {
    accessorKey: "heads",
    header: () => <div className="px-2 py-1">Heads</div>,
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
