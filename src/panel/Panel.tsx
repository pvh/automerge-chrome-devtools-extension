import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import { DocHandleInfo, columns } from "./schema";

export const Panel = () => {
  const [docHandlesInfo, setDocHandlesInfo] = useState<DocHandleInfo[]>([]);

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
    <div>
      <DataTable columns={columns} data={docHandlesInfo} />
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
