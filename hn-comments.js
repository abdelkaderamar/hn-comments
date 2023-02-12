chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log(
    sender.tab
      ? " from a content script:" + sender.tab.url
      : " from the extension"
  );
  if (msg.command === "get-selected-text") {
    console.log("Add selection to clipboard");
    var selection = window.getSelection();
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
