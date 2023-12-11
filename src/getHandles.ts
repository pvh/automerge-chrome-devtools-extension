import browser from 'webextension-polyfill'

declare var Automerge: any

// Note: this isn't a closure
export const devtoolInvoke = (fn: Function) =>
  browser.devtools.inspectedWindow
    .eval(`(${fn.toString()})()`)
    .then((res) => res[0])

export const getHandles = () =>
  devtoolInvoke(() =>
    Object.values((window as any).repo.handles).map((handle: any) => {
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
  )
