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

function getSelectionHTML() {
  var userSelection;
  if (window.getSelection) {
    // W3C Ranges
    userSelection = window.getSelection();
    // Get the range:
    if (userSelection.getRangeAt) var range = userSelection.getRangeAt(0);
    else {
      var range = document.createRange();
      range.setStart(userSelection.anchorNode, userSelection.anchorOffset);
      range.setEnd(userSelection.focusNode, userSelection.focusOffset);
    }
    // And the HTML:
    var clonedSelection = range.cloneContents();
    var div = document.createElement("div");
    div.appendChild(clonedSelection);
    return div.innerHTML;
  } else if (document.selection) {
    // Explorer selection, return the HTML
    userSelection = document.selection.createRange();
    return userSelection.htmlText;
  } else {
    return "";
  }
}

function exportStoryCommentsToText(storyId) {
  chrome.storage.local.get(["hn_clipboard"], function (items) {
    if (storyId in items.hn_clipboard) {
      console.log(items.hn_clipboard[storyId].story_url);
      console.log(items.hn_clipboard[storyId].url);
      console.log(items.hn_clipboard[storyId].title);
      console.log(items.hn_clipboard[storyId].comments);
      fileContent = `title: ${items.hn_clipboard[storyId].title}\n`;
      fileContent += `story_url: ${items.hn_clipboard[storyId].story_url}\n`;
      fileContent += `url: ${items.hn_clipboard[storyId].url}\n`;
      fileContent += "-------------------------\n";
      for (selection of items.hn_clipboard[storyId].comments) {
        if (selection === null) {
          continue;
        }
        console.log(selection);
        fileContent +=
          stripHTML(selection).trim() + "\n" + "-------------------------\n";
      }
      console.log("File content:");
      console.log(fileContent);

      const filename = `story-${storyId}.txt`;
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
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
    }
  });
}

function exportStoryCommentsToYaml(storyId)
{
  chrome.storage.local.get(["hn_clipboard"], function (items) {
    if (storyId in items.hn_clipboard) {
      console.log(items.hn_clipboard[storyId].story_url);
      console.log(items.hn_clipboard[storyId].url);
      console.log(items.hn_clipboard[storyId].title);
      console.log(items.hn_clipboard[storyId].comments);
      fileContent = "";
      for (selection of items.hn_clipboard[storyId].comments) {
        if (selection === null) {
          continue;
        }
        console.log(`selection = ${selection}`);
        const textContent = stripHTML(selection);
        lines = textContent.trim().split("\n");
        let yamlDoc = "comment: | \n";
        for (line of lines) {
          yamlDoc += " " + line + "\n";
        }
        yamlDoc += "---\n";
        fileContent += yamlDoc;
      }

      fileContent =
        "---" +
        "\n" +
        "title: " +
        items.hn_clipboard[storyId].title +
        "\n" +
        "story_url: " +
        items.hn_clipboard[storyId].story_url +
        "\n" +
        "url: " +
        items.hn_clipboard[storyId].url +
        "\n" +
        "---" +
        "\n" +
        fileContent;

      console.log("File content:");
      console.log(fileContent);

      const filename = `story-${storyId}.yaml`;
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download(
        {
          url: "data:text/yaml," + encodeURIComponent(fileContent),
          filename: filename,
          conflictAction: "prompt",
        },
        function (downloadId) {
          console.log("File has been saved with ID: " + downloadId);
          // not recognized
          // chrome.downloads.showDefaultFolder(downloadId);
        }
      );
    }
  });
}

function exportStoryCommentsToMd(storyId) {
  chrome.storage.local.get(["hn_clipboard"], function (items) {
    if (storyId in items.hn_clipboard) {
      console.log(items.hn_clipboard[storyId].story_url);
      console.log(items.hn_clipboard[storyId].url);
      console.log(items.hn_clipboard[storyId].title);
      console.log(items.hn_clipboard[storyId].comments);
      fileContent = "";
      for (selection of items.hn_clipboard[storyId].comments) {
        if (selection === null) {
          continue;
        }
        console.log(`selection = ${selection}`);
        const textContent = stripHTML(selection);
        let mdDoc = "### comment\n";
        mdDoc += textContent + "\n\n";

        fileContent += mdDoc;
      }

      fileContent =
        "# " +
        items.hn_clipboard[storyId].title +
        "\n" +
        "[HN Story Url](" +
        items.hn_clipboard[storyId].story_url +
        ")\n\n" +
        "[Url](" +
        items.hn_clipboard[storyId].url +
        ")\n\n" +
        fileContent;

      console.log("File content:");
      console.log(fileContent);

      const filename = `story-${storyId}.md`;
      const blob = new Blob([fileContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download(
        {
          url: "data:text/markdown," + encodeURIComponent(fileContent),
          filename: filename,
          conflictAction: "prompt",
        },
        function (downloadId) {
          console.log("File has been saved with ID: " + downloadId);
          // not recognized
          // chrome.downloads.showDefaultFolder(downloadId);
        }
      );
    }
  });
}

function clearStoryClipboard(storyId)
{
  chrome.storage.local.get(["hn_clipboard"], function (items) {
    if (storyId in items.hn_clipboard) {
      delete items.hn_clipboard[storyId];
      chrome.storage.local.set({ hn_clipboard: items.hn_clipboard }, function () {
        console.log("Value is set to ", items.hn_clipboard);
        window.location.reload();
      });
    }
  });
}