
main_div = document.querySelector('div.cards');

chrome.storage.local.get(['hn_clipboard'],
  function(items) {
    console.log("Items stored: ", items);
    console.log("Type of stored items: ", typeof(items));
    // for (item of items.hn_clipboard) {
    for (let i=0; i<items.hn_clipboard.length; ++i) {
      let item = items.hn_clipboard[i];
      if (item == null) {
        continue;
      }
      console.log(item);
      const card = document.createElement('div');
      card.className = "card";
      card.setAttribute("id", i);
      const span = document.createElement('span');
      span.innerHTML = item;
      card.appendChild(span);
      const closeBtn = document.createElement('button');
      closeBtn.innerText = 'X';
      closeBtn.className = "remove-btn";
      closeBtn.addEventListener("click", function() {
        removeItem(closeBtn);
      });
      const btnDiv = document.createElement('div');
      btnDiv.append(closeBtn);
      card.append(btnDiv);
      main_div.appendChild(card);
    }
  }
);

function removeItem(item) {
  console.log("remove item ", item);
  const card = item.closest("div.card")
  console.log(card);
  if (card) {
    card.remove();
    const id = card.getAttribute('id');
    console.log(typeof(id));
    const idx = parseInt(id);
    chrome.storage.local.get(['hn_clipboard'],
    function(items) {
      console.log("Removing the element with index ", idx);
      delete items.hn_clipboard[idx];
      console.log(items.hn_clipboard);
      chrome.storage.local.set({ hn_clipboard: items.hn_clipboard }, function () {
        console.log("HN clipboard updated");
      });
    });
  }
}
