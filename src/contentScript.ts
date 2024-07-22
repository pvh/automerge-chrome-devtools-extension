// here we don't have access to the global repo variable so we need
// to inject a script into the page
const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
document.head.append(script);
