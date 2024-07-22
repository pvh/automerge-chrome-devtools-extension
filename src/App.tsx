chrome.devtools.inspectedWindow.eval(
  `
  Object.values(window.repo.handles).map((handle) => {
    const { url, state } = handle
    let count = undefined
    let heads = []
    const doc = handle.docSync()
    if (doc) {
      count = Automerge.getAllChanges(doc).length
      heads = Automerge.getHeads(doc)
    }
    return { url, state, count, heads }
  })
  `,
  function (handles, isException) {
    if (isException) {
      document.body.innerText = "the page is not using automerge";
      console.log(isException);
      return;
    }
    let table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>URL</th>
          <th>State</th>
          <th>Num Changes</th>
          <th>Heads</th>
        </tr>
      </thead>
    `;
    table.style =
      "width: 100%; border-collapse: collapse; border: 1px solid black; text-align: left; padding: 5px; margin: 5px;";
    table.tHead.style =
      "font-weight: bold; border-bottom: 1px solid black; padding: 5px; margin: 5px;";
    handles.map(({ url, state, count, heads }) => {
      let tr = document.createElement("tr");
      let td = document.createElement("td");
      td.innerText = url;
      tr.appendChild(td);
      td = document.createElement("td");
      td.innerText = state;
      tr.appendChild(td);
      td = document.createElement("td");
      td.innerText = count === undefined ? "?" : count;
      tr.appendChild(td);
      td = document.createElement("td");
      td.innerText = heads;
      tr.appendChild(td);
      table.appendChild(tr);
    });
    document.body.appendChild(table);
  }
);

function App() {
  return "todo 2";
}

export default App;
