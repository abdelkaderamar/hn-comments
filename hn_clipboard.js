
main_div = document.querySelector('div.cards');

chrome.storage.local.get(['hn_clipboard'],
  function(items) {
    console.log("Items stored: ", items);
    console.log("Type of stored items: ", typeof(items));
    for (item of items.hn_clipboard) {
      console.log(item);
      const card = document.createElement('div');
      card.className = "card";
      const span = document.createElement('span');
      span.innerHTML = item;
      card.appendChild(span);
      main_div.appendChild(card);
    }
  }
);