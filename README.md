# Automerge DevTools

A Chrome DevTools extension to increase visibility into the state of your Automerge Repo.

This extension abuses internal APIs and is likely to break without warning due to point releases.

## Running this extension

1. Clone this repository.
2. Run `npm install` and `npm run build`
3. Load the `dist` directory in Chrome as an [unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked).
4. Optionally, run `npm run dev` and start editing the code.
5. Navigate to a webpage and open the devtools window.
6. Click on the new devtools panel named "Automerge".

## Acknowledgements

Initially authored by Peter van Hardenberg. Derived from [Chrome's sample code](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/devtools/inspectedWindow).
