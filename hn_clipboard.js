

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

export_to_md_btn = document.querySelector("button#export-to-md");
export_to_md_btn.addEventListener("click", function() {
  exportToMd();
});

clear_clipboard_btn = document.querySelector("button#clear-hn-cb");
clear_clipboard_btn.addEventListener("click", function() {
  clearClipboard();
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
  console.log("Command: ", info, tab);
  if (info.menuItemId === "hn-clipboard-edit") {
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

  exportStoryCommentsToText(storyId);
}

function exportToYaml() {
  const storyId = select_elt.options[select_elt.selectedIndex].value;
  console.log("Selected = ", storyId);

  exportStoryCommentsToYaml(storyId);
}

function exportToMd() {
  const storyId = select_elt.options[select_elt.selectedIndex].value;
  console.log("Selected = ", storyId);

  exportStoryCommentsToMd(storyId);
}

function clearClipboard() {
  const storyId = select_elt.options[select_elt.selectedIndex].value;
  console.log("Selected = ", storyId);

  clearStoryClipboard(storyId);
}