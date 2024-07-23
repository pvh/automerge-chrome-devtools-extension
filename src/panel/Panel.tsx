import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import {
  DocHandleState,
  docHandleStateColumns,
  Message,
  messageInfoColumns,
} from "./schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Panel = () => {
  const [docHandleStates, setDocHandlesInfo] = useState<DocHandleState[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("documents");
  const [messages, setMessages] = useState<Message[]>([]);

  const refreshData = () => {
    getActiveHandlesInfo().then((info) => {
      setDocHandlesInfo(info);
    });
  };

  // refresh handle state
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // listen for repo messages
  useEffect(() => {
    getPortIdOfActiveTab().then((activePortId) => {
      chrome.runtime.onMessageExternal.addListener((data) => {
        const { action, message, portId } = data;
        if (action === "repo-message" && portId === activePortId) {
          const { type, targetId, senderId, documentId } = message;

          setMessages((messages) =>
            messages.concat({
              type,
              targetId,
              senderId,
              documentId,
              timestamp: Date.now(),
            })
          );
        }
      });
    });
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="bg-gray-100">
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
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {selectedTab === "documents" && (
          <DataTable
            columns={docHandleStateColumns}
            data={docHandleStatesWithMessages(docHandleStates, messages)}
          />
        )}
        {selectedTab === "messages" && (
          <DataTable columns={messageInfoColumns} data={messages} />
        )}
      </div>
    </div>
  );
};

const getActiveHandlesInfo = () =>
  new Promise<DocHandleState[]>((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(
      `
    Object.values(window.repo.handles).map((handle) => {
      const { url, state } = handle
      let count = undefined
      let heads = []
      const doc = handle.docSync()
      if (doc) {
        numberOfChanges = Automerge.getAllChanges(doc).length
        heads = Automerge.getHeads(doc)
      }
      return { url, state, numberOfChanges, heads }
    })
    `,
      (docHandlesInfo, isException) => {
        if (isException) {
          reject();
          return;
        }

        resolve(docHandlesInfo as DocHandleState[]);
      }
    );
  });

const getPortIdOfActiveTab = () =>
  new Promise<number>((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(
      "window.repo.__AUTOMERGE_DEVTOOLS__PORT_ID__",
      (docHandlesInfo, isException) => {
        if (isException) {
          reject();
          return;
        }

        resolve(docHandlesInfo as number);
      }
    );
  });

const docHandleStatesWithMessages = (
  states: DocHandleState[],
  messages: Message[]
) => {
  return states.map((state) => ({
    ...state,
    messages: messages.filter(
      (message) => `automerge:${message.documentId}` === state.url
    ),
  }));
};
