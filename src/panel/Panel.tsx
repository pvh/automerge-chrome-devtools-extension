import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import {
  DocHandleState,
  docHandleStateColumns,
  DocHandleStateWithMessages,
  messageInfoColumns,
  RepoMessageWithTimestamp,
} from "./schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAutoScrollUp, useLocalstorageState } from "./hooks";
import { SyncMessage } from "@automerge/automerge-repo";
import { Server } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Panel = () => {
  const [docHandleStates, setDocHandleStates] = useState<DocHandleState[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("documents");

  const [username, setUsername] = useLocalstorageState("username", "");
  const [password, setPassword] = useLocalstorageState("password", "");

  const [tempUsername, setTempUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [loginState, setLoginState] = useState<"loading" | "error" | "idle">(
    "idle"
  );

  const isLoggedIn = username && password;

  console.log({ username, password });

  const onLogIn = async () => {
    if (!tempUsername || !tempPassword) {
      return;
    }

    setLoginState("loading");
    const response = await fetchSyncServerMetrics(tempUsername, tempPassword);

    if (response) {
      setUsername(tempUsername);
      setPassword(tempPassword);
    } else {
      setLoginState("error");
    }
  };

  const onLogOut = () => {
    setUsername("");
    setPassword("");
  };

  const [messages, setMessages] = useState<RepoMessageWithTimestamp[]>([]);
  const [messagesScrollContainer, setMessagesScrollContainer] =
    useState<HTMLDivElement | null>(null);

  useAutoScrollUp(messagesScrollContainer);

  const refreshRepoState = () => {
    getRepoStateUpdate().then(({ docHandleStates, newMessages }) => {
      setDocHandleStates(docHandleStates);
      setMessages((messages) => messages.concat(newMessages));
    });
  };

  // refresh handle state
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRepoState();
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
          <TabsList className="grid w-full grid-cols-2 rounded-none justify-start">
            <TabsTrigger value="documents" className="w-fit">
              Documents ({docHandleStates.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="w-fit">
              Messages
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex-1" />

        <Button
          variant="ghost"
          className="p-0 px-2"
          onClick={handleClearMessages}
        >
          clear messages
        </Button>

        <div className="border border-l border-gray-300"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="p-0 px-2 flex gap-2">
              <Server
                size={16}
                className={isLoggedIn ? "text-green-500" : "text-gray-400"}
              />
              Server Metrics
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="p-4 flex flex-col gap-2 w-[300px]"
            align="end"
          >
            {isLoggedIn ? (
              <Button onClick={onLogOut}>Log out</Button>
            ) : (
              <>
                <div className="pb-4">
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
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 min-h-0">
        <div
          className={`h-full overflow-auto ${
            selectedTab !== "documents" ? "hidden" : ""
          }`}
        >
          <DataTable
            columns={docHandleStateColumns}
            data={docHandleStatesWithMessages(docHandleStates, messages)}
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
  docHandleStates: DocHandleState[];
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
              numberOfChanges = stats.numChanges
              numberOfOps = stats.numOps

            // as a fallback we use getAllChanges
            } else {
              numberOfChanges = Automerge.getAllChanges(doc).length            
            }
          }

          return { url, state, numberOfChanges, numberOfOps, heads }
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

const docHandleStatesWithMessages = (
  docHandleStates: DocHandleState[],
  messages: RepoMessageWithTimestamp[]
): DocHandleStateWithMessages[] => {
  return docHandleStates.map((docHandleState) => {
    const docMessages = messages.filter(
      (message) =>
        "documentId" in message &&
        `automerge:${message.documentId}` === docHandleState.url
    );

    const docSyncMessages = docMessages.filter(
      ({ type }) => type === "sync"
    ) as RepoMessageWithTimestamp<SyncMessage>[];

    return {
      ...docHandleState,
      messages: docMessages,
      syncMessages: docSyncMessages,
      lastSyncedTimestamp:
        docSyncMessages.length > 0
          ? Math.max(...docSyncMessages.map((msg) => msg.timestamp))
          : undefined,
    };
  });
};

const SYNC_SERVER_METRICS_URL = "https://sync.automerge.org/metrics";

const fetchSyncServerMetrics = async (username: string, password: string) => {
  return fetch(SYNC_SERVER_METRICS_URL, {
    method: "GET",
    headers: {
      Authorization: "Basic " + btoa(username + ":" + password),
    },
  })
    .then((response) => response.json())
    .catch(() => null);
};
