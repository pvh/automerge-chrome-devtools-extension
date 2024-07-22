import * as Automerge from "@automerge/automerge";
import { ColumnDef } from "@tanstack/react-table";

export type DocHandleInfo = {
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

export const columns: ColumnDef<DocHandleInfo>[] = [
  {
    accessorKey: "url",
    header: "Url",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "numberOfChanges",
    header: "Changes",
  },
  {
    accessorKey: "heads",
    header: "Heads",
  },
];
