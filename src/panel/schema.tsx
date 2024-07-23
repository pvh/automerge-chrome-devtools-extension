import { Button } from "@/components/ui/button";
import * as Automerge from "@automerge/automerge";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

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
  heads: Automerge.Heads;
};

export type DocHandleStateWithMessages = DocHandleState & {
  messages: Message[];
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
    accessorKey: "heads",
    header: "Heads",
  },
];

export type Message = {
  type: string;
  targetId: string;
  documentId: string;
  senderId: string;
  timestamp: number;
};

export const messageInfoColumns: ColumnDef<Message>[] = [
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
    accessorKey: "documentId",
    header: "DocumentId",
  },
];
