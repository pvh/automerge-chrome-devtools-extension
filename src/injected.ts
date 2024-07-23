import { Repo } from "@automerge/automerge-repo";

const TIMEOUT = 5000;
const startTime = Date.now();

const currentScriptUrl = (document.currentScript! as HTMLScriptElement).src;
const urlParams = new URLSearchParams(new URL(currentScriptUrl).search);
const extensionId = urlParams.get("extensionId") as string;

const initRepo = () => {
  // @ts-expect-error Property 'repo' does not exist on type 'Window & typeof globalThis'.
  const repo = window.repo as Repo;

  // poll to check if repo is set, timeout after 5 seconds
  if (!repo) {
    if (Date.now() - startTime < TIMEOUT) {
      setTimeout(initRepo, 10);
    }
    return;
  }

  // HACK: set id on repo so Panel can filter out messages from other tabs
  // @ts-expect-error monkey patch repo
  const portId = (repo.__AUTOMERGE_DEVTOOLS__PORT_ID__ = Math.round(
    Math.random() * 10000
  ));

  repo.networkSubsystem.addListener("message", (message) => {
    try {
      chrome.runtime.sendMessage(extensionId, {
        portId,
        action: "repo-message",
        message,
      });
    } catch (err) {
      console.log("failed", err);
      // ignore error: send message throws an error if there is no receiver
    }
  });
};

initRepo();
