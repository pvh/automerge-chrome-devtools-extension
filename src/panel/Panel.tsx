import { DataTable } from "./DataTable";
import { DocHandleInfo, columns } from "./schema";
import { useState, useEffect } from "react";

export const Panel = () => {
  const [docHandlesInfo, setDocHandlesInfo] = useState<DocHandleInfo[]>([]);

  useEffect(() => {
    getActiveHandlesInfo().then((info) => {
      setDocHandlesInfo(info);
    });
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
