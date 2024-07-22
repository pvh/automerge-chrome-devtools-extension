import { Repo } from "@automerge/automerge-repo";

const TIMEOUT = 5000;
const startTime = Date.now();

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

  repo.networkSubsystem.addListener("message", (message) => {
    try {
      // todo: inject extension id dynamically here
      chrome.runtime.sendMessage("gmebpffeffdfnggobcomabdfileillme", {
        action: "repo-message",
        message,
      });
    } catch (err) {
      // ignore error: send message throws an error if there is no receiver
    }
  });
};

initRepo();
