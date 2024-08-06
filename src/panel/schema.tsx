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
    header: "Url",
  },
  {
    accessorKey: "state",
    header: ({ column }) => {
      return (
        <Button
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
    accessorFn: ({ messages }) =>
      messages.filter(({ type }) => type === "sync").length,
    header: "Sync messages",
  },
  {
    accessorKey: "lastSyncedTimestamp",
    header: ({ column }) => {
      return (
        <Button
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
      return <div className="whitespace-nowrap">{duration}</div>;
    },
  },
  {
    accessorKey: "numberOfChanges",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Changes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "numberOfOps",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ops
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue<number>("numberOfOps") ?? "-";
      return <div className="whitespace-nowrap">{value}</div>;
    },
  },
  {
    accessorKey: "heads",
    header: "Heads",
  },
];

export type RepoMessageWithTimestamp<T extends RepoMessage = RepoMessage> =
  T & {
    timestamp: number;
  };

export const messageInfoColumns: ColumnDef<RepoMessageWithTimestamp>[] = [
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "senderId",
    header: "Sender",
  },
  {
    accessorKey: "targetId",
    header: "Target",
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
  },
  {
    accessorKey: "documentId",
    header: "DocumentId",
  },
];
