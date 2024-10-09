import { Repo } from "@automerge/automerge-repo";
import { RepoMessage } from "node_modules/@automerge/automerge-repo/src";

const TIMEOUT = 5000;
const MAX_BUFFERED_MESSAGES = 1000;
const startTime = Date.now();

/* const currentScriptUrl = (document.currentScript! as HTMLScriptElement).src;
const urlParams = new URLSearchParams(new URL(currentScriptUrl).search);
const extensionId = urlParams.get("extensionId") as string; */

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

  //@ts-expect-error monkey patch repo with messags so dev tool can retrieve them
  (repo.__DEV_TOOL_BUFFERED_MESSAGES__ = []) as RepoMessage[];

  repo.networkSubsystem.addListener("message", (message) => {
    //@ts-expect-error add message to monkey patched message buffer
    const bufferedMessages = repo.__DEV_TOOL_BUFFERED_MESSAGES__;

    // drop earlier messages if we reached the limit
    if (bufferedMessages.length === MAX_BUFFERED_MESSAGES) {
      bufferedMessages.shift();
    }

    bufferedMessages.push({
      ...message,
      timestamp: Date.now(),
    });
  });
};

initRepo();
