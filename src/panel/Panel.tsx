import { useCallback, useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import {
  DocHandleClientMetrics,
  docHandleMetricsColumns,
  DocHandleMetrics,
  messageInfoColumns,
  RepoMessageWithTimestamp,
  DocHandleServerMetrics,
} from "./schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAutoScrollUp, useLocalstorageState } from "./hooks";
import { AutomergeUrl, SyncMessage } from "@automerge/automerge-repo";
import { Server } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const CLIENT_REFRESH_INTERVAL = 500;
const SERVER_REFRESH_INTERVAL = 1000;

export const Panel = () => {
  const [docHandlesClientMetrics, setDocHandlesClientMetrics] = useState<
    DocHandleClientMetrics[]
  >([]);
  const [selectedTab, setSelectedTab] = useState<string>("documents");

  const [username, setUsername] = useLocalstorageState("username", "");
  const [password, setPassword] = useLocalstorageState("password", "");

  const [tempUsername, setTempUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const [loginState, setLoginState] = useState<"loading" | "error" | "idle">(
    "idle"
  );

  const [messages, setMessages] = useState<RepoMessageWithTimestamp[]>([]);
  const [messagesScrollContainer, setMessagesScrollContainer] =
    useState<HTMLDivElement | null>(null);

  const [showAllDocHandles, setShowAllDocHandles] = useState(false);

  const [docHandleServerMetricsByDocUrl, setDocHandleServerMetricsByDocUrl] =
    useState<Record<AutomergeUrl, DocHandleServerMetrics> | null>(null);

  const isLoggedIn = username && password;
  const failedToLoadServerMetrics =
    isLoggedIn && !docHandleServerMetricsByDocUrl;

  const onLogIn = async () => {
    if (!tempUsername || !tempPassword) {
      return;
    }

    setLoginState("loading");
    const response = await fetchSyncServerMetrics(tempUsername, tempPassword);

    if (response) {
      setUsername(tempUsername);
      setPassword(tempPassword);
      setLoginState("idle");
      setDocHandleServerMetricsByDocUrl(response);
    } else {
      setLoginState("error");
    }
  };

  const onLogOut = () => {
    setUsername("");
    setPassword("");
    setTempPassword("");
    setTempUsername("");
  };

  useAutoScrollUp(messagesScrollContainer);

  const refreshRepoState = useCallback(() => {
    getRepoStateUpdate().then(({ docHandleStates, newMessages }) => {
      setDocHandlesClientMetrics(docHandleStates);
      setMessages((messages) => messages.concat(newMessages));
    });
  }, []);

  const refreshSyncServerMetrics = useCallback(async () => {
    if (!username || !password) {
      setDocHandleServerMetricsByDocUrl(null);
    }

    const metrics = await fetchSyncServerMetrics(username, password);
    setDocHandleServerMetricsByDocUrl(metrics);
  }, [password, username]);

  // refresh handle state
  useEffect(() => {
    const clientInterval = setInterval(() => {
      refreshRepoState();
    }, CLIENT_REFRESH_INTERVAL);

    const serverInterval = setInterval(() => {
      refreshSyncServerMetrics();
    }, SERVER_REFRESH_INTERVAL);

    return () => {
      clearInterval(clientInterval);
      clearInterval(serverInterval);
    };
  }, [refreshSyncServerMetrics, refreshRepoState]);

  const handleClearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="bg-gray-100 flex gap-2 items-center px-2">
        <Tabs
          className="w-fit"
          onValueChange={setSelectedTab}
          value={selectedTab}
        >
          <TabsList className="grid w- grid-cols-2 rounded-none justify-start">
            <TabsTrigger value="documents" className="w-fit">
              Documents ({docHandlesClientMetrics.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="w-fit">
              Messages
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedTab === "messages" && (
          <Button
            variant="ghost"
            className="p-0 px-2"
            onClick={handleClearMessages}
          >
            clear messages
          </Button>
        )}

        {selectedTab === "documents" && docHandleServerMetricsByDocUrl && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms2"
              checked={showAllDocHandles}
              onCheckedChange={() => setShowAllDocHandles((show) => !show)}
            />
            <label
              htmlFor="terms2"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              show all documents
            </label>
          </div>
        )}

        <div className="flex-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="p-0 px-2 flex gap-2">
              <Server
                size={16}
                className={
                  failedToLoadServerMetrics
                    ? "text-red-500"
                    : isLoggedIn
                    ? "text-green-500"
                    : "text-gray-400"
                }
              />
              Server Metrics
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-4 flex flex-col gap-2 w-[300px]"
            align="end"
          >
            {isLoggedIn ? (
              <>
                <div className="pb-4 text-base">
                  {failedToLoadServerMetrics
                    ? "Failed to load sync service metrics"
                    : "Sync server metrics are up to date"}
                </div>

                <Button onClick={onLogOut}>Log out</Button>
              </>
            ) : (
              <form
                onSubmit={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  onLogIn();
                }}
                className="flex flex-col gap-2"
              >
                <div className="pb-4 text-base">
                  You need to provide user credentials to view the sync server
                  metrics
                </div>

                {loginState === "error" && (
                  <div className="text-red-500">Invalid credentials</div>
                )}

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={tempUsername}
                    onChange={(evt) => setTempUsername(evt.target.value)}
                  />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={tempPassword}
                    onChange={(evt) => setTempPassword(evt.target.value)}
                  />
                </div>

                <Button onClick={onLogIn} disabled={loginState === "loading"}>
                  Log in
                </Button>
              </form>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex-1 min-h-0">
        <div
          className={`h-full overflow-auto ${
            selectedTab !== "documents" ? "hidden" : ""
          }`}
        >
          <DataTable
            columns={docHandleMetricsColumns}
            data={getCombinedDocHandleMetrics(
              docHandlesClientMetrics,
              docHandleServerMetricsByDocUrl,
              messages,
              showAllDocHandles
            )}
          />
        </div>
        <div
          className={`h-full overflow-auto ${
            selectedTab !== "messages" ? "hidden" : ""
          }`}
          ref={setMessagesScrollContainer}
        >
          <DataTable columns={messageInfoColumns} data={messages} />
        </div>
      </div>
    </div>
  );
};

type RepoStateUpdate = {
  newMessages: RepoMessageWithTimestamp[];
  docHandleStates: DocHandleClientMetrics[];
};

const getRepoStateUpdate = () =>
  new Promise<RepoStateUpdate>((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(
      `(() => {
        const newMessages = window.repo.__DEV_TOOL_BUFFERED_MESSAGES__;
        repo.__DEV_TOOL_BUFFERED_MESSAGES__ = [];
        
        const docHandleStates = Object.values(window.repo.handles).map((handle) => {
          const { url, state } = handle
          let count = undefined
          let heads = []
          const doc = handle.docSync()

          let numberOfChanges, numberOfOps

          if (doc) {
            heads = Automerge.getHeads(doc)
            
            // this is a new api that requires @automerge/automerge >= 2.2.8
            if (Automerge.stats) { 
              const stats = Automerge.stats(doc)
              numChanges = stats.numChanges
              numOps = stats.numOps

            // as a fallback we use getAllChanges
            } else {
              numChanges = Automerge.getAllChanges(doc).length            
            }
          }

          return { url, state, size: { numChanges, numOps }, heads }
        })

        return { docHandleStates, newMessages }
      })()
    `,
      (repoState, isException) => {
        if (isException) {
          reject();
          return;
        }

        resolve(repoState as RepoStateUpdate);
      }
    );
  });

const getCombinedDocHandleMetrics = (
  docHandlesClientMetrics: DocHandleClientMetrics[],
  docHandleServerMetricsByDocUrl: Record<
    AutomergeUrl,
    DocHandleServerMetrics
  > | null,
  messages: RepoMessageWithTimestamp[],
  showAll: boolean
): DocHandleMetrics[] => {
  const hasClientDocumentUrl: Record<AutomergeUrl, true> = {};

  const handlesOnClientMetrics = docHandlesClientMetrics.map(
    (docHandleClientMetrics) => {
      const docHandleServerMetrics = docHandleServerMetricsByDocUrl
        ? docHandleServerMetricsByDocUrl[docHandleClientMetrics.url] ?? {
            size: { numChanges: 0, numOps: 0 },
            peers: [],
          }
        : null;

      const docMessages = messages.filter(
        (message) =>
          "documentId" in message &&
          `automerge:${message.documentId}` === docHandleClientMetrics.url
      );

      const docSyncMessages = docMessages.filter(
        ({ type }) => type === "sync"
      ) as RepoMessageWithTimestamp<SyncMessage>[];

      hasClientDocumentUrl[docHandleClientMetrics.url];

      return {
        ...docHandleClientMetrics,
        messages: docMessages,
        syncMessages: docSyncMessages,
        size: {
          numOps: {
            client: docHandleClientMetrics.size.numOps,
            server: docHandleServerMetrics?.size.numOps,
          },
          numChanges: {
            client: docHandleClientMetrics.size.numChanges,
            server: docHandleServerMetrics?.size.numChanges,
          },
        },
        lastSyncedTimestamp:
          docSyncMessages.length > 0
            ? Math.max(...docSyncMessages.map((msg) => msg.timestamp))
            : undefined,
        peers: docHandleServerMetrics?.peers,
      };
    }
  );

  if (!showAll || !docHandleServerMetricsByDocUrl) {
    return handlesOnClientMetrics;
  }

  const handlesNotOnClientMetrics = Object.entries(
    docHandleServerMetricsByDocUrl
  ).flatMap(([url, metrics]) => {
    if (hasClientDocumentUrl[url as AutomergeUrl]) {
      return [];
    }

    return [
      {
        url: url as AutomergeUrl,
        messages: [],
        heads: [], // todo: we don't know the heads
        syncMessages: [],
        state: "on server",
        size: {
          numOps: {
            server: metrics.size.numOps,
          },
          numChanges: {
            server: metrics.size.numChanges,
          },
        },
        peers: metrics.peers,
      },
    ];
  });

  return handlesOnClientMetrics.concat(handlesNotOnClientMetrics);
};

const SYNC_SERVER_METRICS_URL = "https://sync.automerge.org/metrics";

const fetchSyncServerMetrics = async (
  username: string,
  password: string
): Promise<Record<AutomergeUrl, DocHandleServerMetrics> | null> => {
  return fetch(SYNC_SERVER_METRICS_URL, {
    method: "GET",
    headers: {
      Authorization: "Basic " + btoa(username + ":" + password),
    },
  })
    .then((response) => response.json())
    .then(({ documents }) => {
      const byDocumentUrl: Record<AutomergeUrl, DocHandleServerMetrics> = {};
      for (const [documentId, metrics] of Object.entries(documents)) {
        byDocumentUrl[`automerge:${documentId}` as AutomergeUrl] =
          metrics as DocHandleServerMetrics;
      }

      return byDocumentUrl;
    })
    .catch(() => null);
};
