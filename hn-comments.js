function getSelectionHTML() {
  var userSelection;
  if (window.getSelection) {
  // W3C Ranges
  userSelection = window.getSelection ();
  // Get the range:
  if (userSelection.getRangeAt)
    var range = userSelection.getRangeAt (0);
  else {
    var range = document.createRange ();
    range.setStart (userSelection.anchorNode, userSelection.anchorOffset);
    range.setEnd (userSelection.focusNode, userSelection.focusOffset);
  }
  // And the HTML:
  var clonedSelection = range.cloneContents ();
  var div = document.createElement ('div');
  div.appendChild (clonedSelection);
  return div.innerHTML;
  } else if (document.selection) {
  // Explorer selection, return the HTML
  userSelection = document.selection.createRange ();
  return userSelection.htmlText;
  } else {
  return '';
  }
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log(
    sender.tab
      ? " from a content script:" + sender.tab.url
      : " from the extension"
  );
  if (msg.command === "get-selected-text") {
    console.log("Add selection to clipboard");
    var selection = window.getSelectionHTML();
    console.log("Selection = ", selection);
    sendResponse({
      body: selection,
      url: window.location.href,
      subject: document.title});
  }
  else {
    sendResponse(null);
  }
});
