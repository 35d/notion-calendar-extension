/** 遅延 */
const DELAY_TIME = 300;

/** ボタンスタイル */
const STYLES = `
font-size: 11px;
margin-left: 6px;
`;

/** 追加される DOM 要素を取得 */
const getDOM = (className) => `
  <button style="${STYLES}" class="${className}" id="appendCompleteButton">完了</button>
`;

/** Notion の接続情報 */
let databaseId = "";
let token = "";
let status = "";
let date = "";

/** 即時実行 */
$(document).ready(() => {
  appendCompleteButton();
  getStorageData();

  // イベントリスナを登録
  $(document).on("click", appendCompleteButton);
  $(document).on("click", "#appendCompleteButton", onClick);
});

/** 完了ボタンを追加する */
const appendCompleteButton = () => {
  setTimeout(() => {
    if ($("#appendCompleteButton").length > 0) return;
    const button = $("div:contains('Notionで開く')").parent("button");
    const parent = button.parent();
    const className = button.attr("class");
    parent.append(getDOM(className));
  }, DELAY_TIME);
};

/** ボタンをクリックした際のイベントハンドラ */
const onClick = () => {
  // Notion の接続情報が設定されていない場合は、設定画面を開く
  if (!databaseId || !token) {
    openOptionsPage();
    return;
  }

  const title = $("div:contains('イベント')").find("p").text();
  post(title, databaseId, token);
};

/** TODO: Post 処理 */
const post = (title, databaseId, token) => {
  // バリデータ実装
  console.log(title, databaseId, token);
};

/** Chrome のストレージに入っている情報を取得 */
const getStorageData = () => {
  chrome.storage.sync.get(["token", "databaseId", "status", "date"], (items) => {
    databaseId = items.databaseId;
    token = items.token;
    status = items.status || "ステータス";
    date = items.date || "日付";
  });
};

/** 設定画面を開く */
const openOptionsPage = () => {
  chrome.runtime.sendMessage({ action: "openOptionsPage" });
};
