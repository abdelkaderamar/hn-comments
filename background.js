const hn_filter = ["https://news.ycombinator.com/*", "*://*/clipboard.html"];

let HnClipboard = new Array();

function addMenuItem(id, title, contexts) {
  chrome.contextMenus.create({
    id: id,
    title: title,
    contexts: contexts,
    documentUrlPatterns: hn_filter,
  });
}

function addMenuSeparator(id) {
  chrome.contextMenus.create({
    id: "separator-" + id,
    type: "separator",
    contexts: ["all"],
    documentUrlPatterns: hn_filter,
  });
}

addMenuItem("add-to-hn-clipboard", "Add selection to HN clipboard", [
  "selection",
]);
addMenuItem(
  "extract-comments-with-links",
  "Add comments with links to HN clipboard",
  ["all"]
);
addMenuSeparator(1);
addMenuItem("show-hn-clipboard", "Show to HN clipboard", ["all"]);
addMenuSeparator(2);
addMenuItem("export-to-text", "Export to text", ["all"]);
addMenuItem("export-to-yaml", "Export to YAML", ["all"]);
addMenuSeparator(3);
addMenuItem("clear-hn-clipboard", "Clear HN clipboard", ["all"]);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-hn-clipboard") {
    console.log("Add selection to clipboard: ", info, tab);
    addSelectionToClipboard(info, tab);
    return;
  }
  if (info.menuItemId === "extract-comments-with-links") {
    console.log("Extract comments with links: ", info);
    return;
  }
  if (info.menuItemId === "show-hn-clipboard") {
    console.log("Show clipboard: ", info);
    return;
  }
  if (info.menuItemId === "export-to-text") {
    console.log("Export to text");
    return;
  }
  if (info.menuItemId === "export-to-yaml") {
    console.log("Export to YAML");
    return;
  }
  if (info.menuItemId === "clear-hn-clipboard") {
    console.log("Clear HN clipboard");
    return;
  }
});

function addSelectionToClipboard() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      { command: "get-selected-text" },
      function (response) {
        console.log("Receiving response ", response);
        console.log("typeof response = ", typeof(response));
        if (response === null) {
          console.warn("No response received");
          return;
        }
        HnClipboard.push(response.body);
        chrome.storage.local.set({ hn_clipboard: HnClipboard }, function () {
          console.log("Value is set to " + HnClipboard);
        });

        chrome.storage.local.get(["hn_clipboard"], function (items) {
          console.log("#1 ", items);
          console.log("#1 Type = ", typeof items);
        });
      }
    );
  });
}
