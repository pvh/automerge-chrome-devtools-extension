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
import { useAutoScrollUp } from "./hooks";
import { SyncMessage } from "@automerge/automerge-repo";

export const Panel = () => {
  const [docHandleStates, setDocHandleStates] = useState<DocHandleState[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("documents");
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
      console.log("refresh");
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
      <div className="bg-gray-100 flex">
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
        <Button variant="ghost" onClick={handleClearMessages}>
          clear messages
        </Button>
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
          console.log("failed", isException);
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
