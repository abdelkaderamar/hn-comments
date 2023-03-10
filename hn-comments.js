
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log(
    sender.tab
      ? " from a content script:" + sender.tab.url
      : " from the extension"
  );
  if (msg.command === "get-selected-text") {
    console.log("Add selection to clipboard");
    var selection = getSelectionHTML();
    console.log("Selection = ", selection);
    story_url = document.querySelector("span.titleline>a").getAttribute("href");
    title = document.querySelector("span.titleline>a").innerText;
    console.log("Story url = ", story_url);
    sendResponse({
      body: selection,
      url: window.location.href,
      title: title,
      story_url: story_url,
    });
  }
  else if (msg.command === "get-comments-with-links") {
    console.log("Extract comments with link");
    spans = document.querySelectorAll('span.commtext');
    console.log("spans = ", spans);
    spansWithLink = new Array();
    for (let i = 0; i < spans.length; i++) {
      span = spans[i].cloneNode(true);
      // href=^"reply?" => href start with reply?
      const hasLink = span.querySelector('a:not([href^="reply?"])');
      if (hasLink) {
        const replies = span.querySelectorAll('a[href^="reply?"]');
        console.log("Replies = ", replies);
        for (let reply of  replies) {
          console.log("removing ", reply);
          reply.remove();
        }
        spansWithLink.push(span.innerHTML);
      }
    }
    console.log("spansWithLink = ", spansWithLink);
    console.log("document.url = ", window.location.href);
    story_url = document.querySelector("span.titleline>a").getAttribute("href");
    title = document.querySelector("span.titleline>a").innerText;
    console.log("Story url = ", story_url);
    sendResponse({
      comments: spansWithLink,
      url: window.location.hef,
      title: title,
      story_url: story_url,
    });
  }
  else {
    sendResponse(null);
  }
});
