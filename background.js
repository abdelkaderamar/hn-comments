const hn_filter = ["https://news.ycombinator.com/*"];

const clipboard_filter = ["chrome-extension://lepieaakpbahcminjicfhaidjhdklomp/hn_clipboard.html"];

const all_filter = hn_filter.concat(clipboard_filter);

console.log("Initialising the clipboard");
chrome.storage.local.set({ hn_clipboard: new Map() }, function () {
  console.log("Clipboard initialized");
});

function addMenuItem(id, title, contexts, filter = hn_filter) {
  chrome.contextMenus.create({
    id: id,
    title: title,
    contexts: contexts,
    documentUrlPatterns: filter,
  });
}

function addMenuSeparator(id, filter = hn_filter) {
  chrome.contextMenus.create({
    id: "separator-" + id,
    type: "separator",
    contexts: ["all"],
    documentUrlPatterns: filter,
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
addMenuItem("export-to-md", "Export to Markdown", ["all"]);
addMenuSeparator(3);
addMenuItem("clear-hn-clipboard", "Clear HN clipboard", ["all"]);
addMenuItem("hn-clipboard-edit", "Update selection", ["selection"], clipboard_filter);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-hn-clipboard") {
    console.log("Add selection to clipboard: ", info, tab);
    addSelectionToClipboard(info, tab);
    return;
  }
  if (info.menuItemId === "extract-comments-with-links") {
    extractCommentsWithLinks();
    return;
  }
  if (info.menuItemId === "show-hn-clipboard") {
    console.log("Show clipboard: ", info);
    showHnClipboard();
    return;
  }
  if (info.menuItemId === "export-to-text") {
    exportToText();
    return;
  }
  if (info.menuItemId === "export-to-yaml") {
    exportToYaml();
    return;
  }
  if (info.menuItemId === "export-to-md") {
    exportToMd();
    return;
  }
  if (info.menuItemId === "clear-hn-clipboard") {
    console.log("Clear HN clipboard");
    clearHnClipboard();
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
        console.log("response.body         = ", response.body);
        console.log("typeof(response.body) = ", typeof(response.body));
        chrome.storage.local.get(["hn_clipboard"], function (items) {
          storyId = getStoryId(tab.url);
          console.log(typeof(items.hn_clipboard));
          console.log(items.hn_clipboard);
          if (! (storyId in items.hn_clipboard)) {
            console.log("Init story ", storyId);
            items.hn_clipboard[storyId] = {
              story_url: tab.url,
              title: response.title,
              url: response.story_url,
              comments: new Array(),
            };
            console.log(items.hn_clipboard);
          }
          else {
            console.log("Story is in the clipboard", storyId);
            console.log(JSON.stringify(items.hn_clipboard, null, 4));
          }
          items.hn_clipboard[storyId].comments.push(response.body);

          chrome.storage.local.set({ hn_clipboard: items.hn_clipboard }, function () {
            console.log("Value is set to ", items.hn_clipboard);
          });
          chrome.storage.local.set({ current_story: storyId }, function () {
            console.log("Current story is ", storyId);
          });
        });

        chrome.storage.local.get(["hn_clipboard"], function (items) {
          console.log("#1 ", items);
          console.log("#1 ", items.hn_clipboard);
          console.log("#1 Type = ", typeof items);
        });
      }
    );
  });
}

function extractCommentsWithLinks() {
  console.log("Extract comments with links: ");
  let queryOptions = { active: true, lastFocusedWindow: true };
  chrome.tabs.query(queryOptions, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      { command: "get-comments-with-links" },
      function (response) {
        console.log("Receiving a response: ", response);
        chrome.storage.local.get(["hn_clipboard"], function (items) {
          storyId = getStoryId(tab.url);
          console.log(typeof items.hn_clipboard);
          console.log(items.hn_clipboard);
          if (!(storyId in items.hn_clipboard)) {
            console.log("Init story ", storyId);
            items.hn_clipboard[storyId] = {
              story_url: tab.url,
              title: response.title,
              url: response.story_url,
              comments: new Array(),
            };
            console.log(items.hn_clipboard);
          } else {
            console.log("Story is in the clipboard", storyId);
            console.log(JSON.stringify(items.hn_clipboard, null, 4));
          }
          for (comment of response.comments) {
            console.log(comment);
            items.hn_clipboard[storyId].comments.push(comment);
          }
          chrome.storage.local.set(
            { hn_clipboard: items.hn_clipboard },
            function () {
              console.log("Value is set to ", items.hn_clipboard);
            }
          );
          chrome.storage.local.set({ current_story: storyId }, function () {
            console.log("Current story is ", storyId);
          });

        });
      }
    );
  });
}

function showHnClipboard() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentStory = getStoryId(tabs[0].url);
    chrome.storage.local.set({ current_story: currentStory }, function () {
      console.log("Current story is ", currentStory);
    });
    chrome.tabs.create({
      url: chrome.runtime.getURL("hn_clipboard.html"),
    });
  });
}

function clearHnClipboard() {
  chrome.storage.local.set({ hn_clipboard: new Map() }, function () {
    console.log("Value is set to " + new Map());
  });
}

function cleanLinksText(element)
{
  a_elts = element.querySelectorAll("a");
  for (a of a_elts) {
    console.log(a.getAttribute("href"));
    a.innerText = " " + a.getAttribute("href") + " ";
  }
  console.log(element)
}

function stripHTML(html)
{
   let tmp = document.createElement("div");
   tmp.innerHTML = html;
   cleanLinksText(tmp);
   tmp.innerHTML = tmp.innerHTML.replace('<p>', '\n</p>');
   return  tmp.textContent || tmp.innerText || "";
}

function getStoryId(url) 
{
  console.log("Get the story id of url ", url);
  storyId = url.replace(
    "https://news.ycombinator.com/item?id=",
    ""
  );
  if (storyId === url) {
    storyId = "all";
  }
  console.log("storyId = ", storyId);
  return  storyId;
}

function exportToText() {
  console.log("Export to text");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var currentTabUrl = currentTab.url;
    storyId = currentTabUrl.replace(
      "https://news.ycombinator.com/item?id=",
      ""
    );
    console.log("currentTabUrl = ", currentTabUrl);
    console.log("storyId       = ", storyId);
    if (storyId != currentTabUrl) {
      exportStoryCommentsToText(storyId);
    }
  });
}

function exportToYaml() {
  console.log("Export to YAML");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var currentTabUrl = currentTab.url;
    storyId = currentTabUrl.replace(
      "https://news.ycombinator.com/item?id=",
      ""
    );
    console.log("currentTabUrl = ", currentTabUrl);
    console.log("storyId       = ", storyId);
    if (storyId != currentTabUrl) {
      exportStoryCommentsToYaml(storyId);
    }
  });  
}

function exportToMd() {
  console.log("Export to Markdown");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    var currentTabUrl = currentTab.url;
    storyId = currentTabUrl.replace(
      "https://news.ycombinator.com/item?id=",
      ""
    );
    console.log("currentTabUrl = ", currentTabUrl);
    console.log("storyId       = ", storyId);
    if (storyId != currentTabUrl) {
      exportStoryCommentsToMd(storyId);
    }
  });  
}



chrome.commands.onCommand.addListener((command) => {
  console.log(`# Command "${command}" triggered`);
  console.log(command);
  if (command === "add-selected") {
    addSelectionToClipboard();
  }
  else if (command == "export-clipboard") {
    exportToText();
  }
});

