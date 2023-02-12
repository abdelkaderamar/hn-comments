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

// chrome.contextMenus.create({
//   id: "add-to-hn-clipboard",
//   title: "Add selection to HN clipboard",
//   contexts: ["selection"],
//   documentUrlPatterns: hn_filter,
// });

// chrome.contextMenus.create({
//   id: "extract-comments-with-links",
//   title: "Add comments with links to HN clipboard",
//   contexts: ["all"],
//   documentUrlPatterns: hn_filter,
// });

// chrome.contextMenus.create({
//   id: "show-hn-clipboard",
//   title: "Show HN clipboard",
//   contexts: ["all"],
//   documentUrlPatterns: hn_filter,
// });

// chrome.contextMenus.create({
//   id: "separator-1",
//   type: "separator",
//   documentUrlPatterns: hn_filter,
// });

// chrome.contextMenus.create({
//   id: "export-to-text",
//   title: "Export to text",
//   contexts: ["all"],
//   documentUrlPatterns: hn_filter,
// });

// chrome.contextMenus.create({
//   id: "export-to-yaml",
//   title: "Export to YAML",
//   contexts: ["all"],
//   documentUrlPatterns: hn_filter,
// });

// chrome.contextMenus.create({
//   id: "separator-2",
//   type: "separator",
//   documentUrlPatterns: hn_filter,
// });

// chrome.contextMenus.create({
//   id: "clear-hn-clipboard",
//   title: "Clear HN clipboard",
//   contexts: ["all"],
//   documentUrlPatterns: hn_filter,
// });

addMenuItem("add-to-hn-clipboard", "Add selection to HN clipboard", ["selection"]);
addMenuItem("extract-comments-with-links","Add comments with links to HN clipboard", ["all"]);
addMenuSeparator(1);
addMenuItem("show-hn-clipboard", "Show to HN clipboard", ["all"]);
addMenuSeparator(2);
addMenuItem("export-to-text", "Export to text", ["all"]);
addMenuItem("export-to-yaml", "Export to YAML", ["all"]);
addMenuSeparator(3);
addMenuItem("clear-hn-clipboard", "Clear HN clipboard", ["all"]);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-hn-clipboard") {
    console.log("Add selection to clipboard: ", info);
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
