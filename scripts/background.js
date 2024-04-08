/** イベントリスナ登録 */
chrome.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case "openOptionsPage":
      openOptionsPage();
      break;
    default:
      break;
  }
});

/** 設定画面を開く */
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}
