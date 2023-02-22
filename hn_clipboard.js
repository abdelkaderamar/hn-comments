function stripHTML(html)
{
   let tmp = document.createElement("div");
   tmp.innerHTML = html;
   cleanLinksText(tmp);
   tmp.innerHTML = tmp.innerHTML.replace('<p>', '\n</p>');
   return  tmp.textContent || tmp.innerText || "";
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

main_div = document.querySelector("div.cards");

select_elt = document.querySelector("select#stories-select-id");
select_elt.addEventListener("change", function () {
  updateActiveStory(select_elt);
});

export_to_txt_btn = document.querySelector("button#export-to-txt");
export_to_txt_btn.addEventListener("click", function() {
  exportToText();
});

export_to_yaml_btn = document.querySelector("button#export-to-yaml");
export_to_yaml_btn.addEventListener("click", function() {
  exportToYaml();
});


chrome.storage.local.get(["hn_clipboard"], function (items) {
  console.log("Items stored: ", items);
  console.log("Type of stored items: ", typeof items);
  for (const [key, value] of Object.entries(items.hn_clipboard)) {
    console.log("Key = ", key);
    console.log("Val = ", value);
    const option_elt = document.createElement("option");
    option_elt.setAttribute("value", key);
    option_elt.innerText = value.title;
    select_elt.appendChild(option_elt);
  }
  chrome.storage.local.get(["current_story"], function(items) {
    console.log("Current story = ", items.current_story);
    option = document.querySelector(`select.stories-select option[value="${items.current_story}"]`);
    if (option) {
      option.setAttribute("selected", "selected");
      updateActiveStory(select_elt);
    }
  });
});

function removeItem(item) {
  console.log("remove item ", item);
  const card = item.closest("div.card");
  console.log(card);
  if (card) {
    const id = card.getAttribute("id");
    console.log(typeof id);
    const idx = parseInt(id);
    chrome.storage.local.get(["hn_clipboard"], function (items) {
      const storyId = main_div.getAttribute("story-id");
      if (storyId in items.hn_clipboard) {
        console.log("Removing the element with index ", idx);
        delete items.hn_clipboard[storyId].comments[idx];
        console.log(items.hn_clipboard);
        chrome.storage.local.set(
          { hn_clipboard: items.hn_clipboard },
          function () {
            console.log("HN clipboard updated");
            card.remove();
          }
        );
      }
    });
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Update selection ", info, tab);
  console.log(document.getSelection().anchorNode);
  console.log(typeof document.getSelection().anchorNode);
  let selectedCard = document
    .getSelection()
    .anchorNode.parentElement.closest("div.card");
  console.log("Selected card = ", selectedCard);
  if (selectedCard) {
    const id = selectedCard.getAttribute("id");
    console.log(typeof id);
    const idx = parseInt(id);
    selectedHTML = getSelectionHTML();
    chrome.storage.local.get(["hn_clipboard"], function (items) {
      // console.log("Removing the element with index ", idx);
      // delete items.hn_clipboard[idx];
      const storyId = main_div.getAttribute("story-id");
      if (storyId in items.hn_clipboard) {
        items.hn_clipboard[storyId].comments[idx] = selectedHTML;
        selectedCard.innerHTML = selectedHTML;
        console.log(items.hn_clipboard);
        chrome.storage.local.set(
          { hn_clipboard: items.hn_clipboard },
          function () {
            console.log("HN clipboard updated");
          }
        );
      }
    });
  }
});

function addCommentSelection(comment, id) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("id", id);
  const span = document.createElement("span");
  span.innerHTML = comment;
  card.appendChild(span);
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "X";
  closeBtn.className = "remove-btn";
  closeBtn.addEventListener("click", function () {
    removeItem(closeBtn);
  });
  const btnDiv = document.createElement("div");
  btnDiv.append(closeBtn);
  card.append(btnDiv);
  main_div.appendChild(card);
}

function showStories(storyComments) {
  console.log("Show the comments of story ", storyComments.title);
  console.log("StoryComments object       ", storyComments);
  main_div.innerHTML = "";
  for (let i = 0; i < storyComments.comments.length; ++i) {
    const comment = storyComments.comments[i];
    if (comment == null) {
      continue;
    }
    console.log("# ", comment);
    addCommentSelection(comment, i);
  }
}

function updateActiveStory(selected) {
  const storyId = selected.options[selected.selectedIndex].value;
  console.log("Selected = ", storyId);
  main_div.setAttribute("story-id", storyId);
  chrome.storage.local.get(["hn_clipboard"], function (items) {
    if (storyId in items.hn_clipboard) {
      showStories(items.hn_clipboard[storyId]);
    }
  });
}

function exportToText() {
  const storyId = select_elt.options[select_elt.selectedIndex].value;
  console.log("Selected = ", storyId);
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

function exportToYaml() {
  const storyId = select_elt.options[select_elt.selectedIndex].value;
  console.log("Selected = ", storyId);
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

      fileContent = '---' + '\n' + 
      'title: ' + items.hn_clipboard[storyId].title + '\n' + 
      'story_url: ' + items.hn_clipboard[storyId].story_url + '\n' + 
      'url: ' + items.hn_clipboard[storyId].url + '\n' + 
        '---' + '\n' +
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