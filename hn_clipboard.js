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
    // for (let i = 0; i < value.comments.length; ++i) {
    //   let item = value.comments[i];
    //   if (item == null) {
    //     continue;
    //   }
    //   console.log(item);
    //   const card = document.createElement("div");
    //   card.className = "card";
    //   card.setAttribute("id", i);
    //   const span = document.createElement("span");
    //   span.innerHTML = item;
    //   card.appendChild(span);
    //   const closeBtn = document.createElement("button");
    //   closeBtn.innerText = "X";
    //   closeBtn.className = "remove-btn";
    //   closeBtn.addEventListener("click", function () {
    //     removeItem(closeBtn);
    //   });
    //   const btnDiv = document.createElement("div");
    //   btnDiv.append(closeBtn);
    //   card.append(btnDiv);
    //   main_div.appendChild(card);
    // }
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
      items.hn_clipboard[idx] = selectedHTML;
      selectedCard.innerHTML = selectedHTML;
      console.log(items.hn_clipboard);
      chrome.storage.local.set(
        { hn_clipboard: items.hn_clipboard },
        function () {
          console.log("HN clipboard updated");
        }
      );
    });
  }
});

// chrome.runtime.onMessage.addListener((msg, sender) => {
//   console.log(
//     sender.tab
//       ? " from a content script:" + sender.tab.url
//       : " from the extension"
//   );
//   console.log(msg);
//   if (msg.command === 'update-hn-selection') {
//     console.log("Editing the selection");
//     window.postMessage({result: "ok"}, "*");
//   }
// });

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
