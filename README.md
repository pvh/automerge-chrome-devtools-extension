# Automerge DevTools

A Chrome DevTools extension to increase visibility into the state of your Automerge Repo.

This extension abuses internal APIs and is likely to break without warning due to point releases.

## Running this extension

1. Clone this repository.
2. Build it with `yarn install && yarn build`

3. Load this `dist` directory in Chrome as an [unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).
4. Navigate to a webpage and open the devtools window.
5. Navigate to the new devtools panel named "Automerge"

## Acknowledgements

Authored by Peter van Hardenberg & Paul Sonnentag. Derived from [Chrome's sample code](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/devtools/inspectedWindow).
