/** イベントリスナ登録 */
chrome.runtime.onMessage.addListener(async function (message) {
  switch (message.action) {
    case "openOptionsPage":
      openOptionsPage();
      break;
    case "completeSetting":
      const [tab] = await chrome.tabs.query({
        url: "https://calendar.notion.so/*",
      });
      chrome.tabs.sendMessage(tab.id, { action: "syncStorage" });
      break;
    default:
      break;
  }
});

/** 設定画面を開く */
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}
