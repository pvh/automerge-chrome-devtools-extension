import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import { DocHandleInfo, columns } from "./schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Panel = () => {
  const [docHandlesInfo, setDocHandlesInfo] = useState<DocHandleInfo[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>();

  const refreshData = () => {
    getActiveHandlesInfo().then((info) => {
      setDocHandlesInfo(info);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="bg-gray-100">
        <Tabs
          defaultValue="documents"
          className="w-fit"
          onValueChange={setSelectedTab}
          value={selectedTab}
        >
          <TabsList className="grid w-full grid-cols-2 rounded-none justify-start">
            <TabsTrigger value="documents" className="w-fit">
              Documents ({docHandlesInfo.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="w-fit">
              Messages
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {selectedTab === "documents" && (
          <DataTable columns={columns} data={docHandlesInfo} />
        )}
      </div>
    </div>
  );
};

const getActiveHandlesInfo = () =>
  new Promise<DocHandleInfo[]>((resolve, reject) => {
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

        resolve(docHandlesInfo as DocHandleInfo[]);
      }
    );
  });
