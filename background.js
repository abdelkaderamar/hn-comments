const hn_filter = ["https://news.ycombinator.com/*", "*://*/clipboard.html"];

console.log("Initialising the clipboard");
chrome.storage.local.set({ hn_clipboard: new Array() }, function () {
  console.log("Clipboard initialized");
});

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
    extractCommantsWithLinks();
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
          items.hn_clipboard.push(response.body);
          chrome.storage.local.set({ hn_clipboard: items.hn_clipboard }, function () {
            console.log("Value is set to ", items.hn_clipboard);
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

function clearHnClipboard() {
  HnClipboard = new Array();
  chrome.storage.local.set({ hn_clipboard: HnClipboard }, function () {
    console.log("Value is set to " + HnClipboard);
  });
}

function showHnClipboard() {
  chrome.tabs.create(
    {
      url: chrome.runtime.getURL('hn_clipboard.html')
    }
  );
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

function exportToText() {
  console.log("Export to text");
  chrome.storage.local.get(["hn_clipboard"], function(items) {
    fileContent = "";
    for (selection of items.hn_clipboard) {
      if (selection === null) {
        continue;
      }
      console.log(selection);
      fileContent += stripHTML(selection).trim() + '\n' + '-------------------------\n';
    }
    console.log("File content:");
    console.log(fileContent);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      filename = "hn-story.txt";
      var currentTab = tabs[0];
      var currentTabUrl = currentTab.url;
      console.log(currentTabUrl);
      storyId = currentTabUrl.replace(
        "https://news.ycombinator.com/item?id=",
        ""
      );
      console.log("currentTabUrl = ", currentTabUrl);
      console.log("storyId       = ", storyId);
      if (storyId != currentTabUrl) {
        filename = `hn-story-${storyId}.txt`;
      }
      console.log("Filename = ", filename);

      chrome.downloads.download(
        {
          url: "data:text/plain," + encodeURIComponent(fileContent),
          filename: filename,
          conflictAction: "prompt",
        },
        function (downloadId) {
          console.log("File has been saved with ID: " + downloadId);
          // not recognized
          // chrome.downloads.showDefaultFolder(downloadId);
        }
      );
    });

  });
}

function exportToYaml() {
  console.log("Export to YAML");
  chrome.storage.local.get(["hn_clipboard"], function(items) {
    fileContent = "";
    for (selection of items.hn_clipboard) {
      if (selection === null) {
        continue;
      }
      console.log(selection);
      const textContent = stripHTML(selection);
      lines = textContent.trim().split('\n');
      let yamlDoc = 'comment: | \n';
      for (line of lines) {
        yamlDoc += ' ' + line + '\n';
      }
      yamlDoc += '---\n';
      fileContent += yamlDoc;
    }
    console.log("File content:");
    console.log(fileContent);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      yamlFilename = "hn-story.yaml";
      var currentTab = tabs[0];
      var currentTabUrl = currentTab.url;

      fileContent = '---' + '\n' + 
        'url: ' + currentTabUrl + '\n' + 
        '---' + '\n' +
        fileContent;

      storyId = currentTabUrl.replace(
        "https://news.ycombinator.com/item?id=",
        ""
      );
      console.log("currentTabUrl = ", currentTabUrl);
      console.log("storyId       = ", storyId);
      if (storyId != currentTabUrl) {
        yamlFilename = `hn-story-${storyId}.yaml`;
      }
      console.log("Yaml Filename = ", yamlFilename);

      chrome.downloads.download(
        {
          url: "data:text/yaml," + encodeURIComponent(fileContent),
          filename: yamlFilename,
          conflictAction: "prompt",
        },
        function (downloadId) {
          console.log("File has been saved with ID: " + downloadId);
          // not recognized
          // chrome.downloads.showDefaultFolder(downloadId);
        }
      );
    });

  });
}

function extractCommantsWithLinks() {
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
          for (comment of response.comments) {
            console.log(comment);
            items.hn_clipboard.push(comment);
          }
          chrome.storage.local.set(
            { hn_clipboard: items.hn_clipboard },
            function () {
              console.log("Value is set to ", items.hn_clipboard);
            }
          );
        });
      }
    );
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

