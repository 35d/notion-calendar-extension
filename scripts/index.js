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

/** Notion の情報 */
let databaseId = "";
let token = "";
let statusPropertyId = "";
let statusOptionId = "";
let datePropertyId = "";

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
  complete(title);
};

const complete = async (title) => {
  // バリデータ実装
  const result = await fetch(
    "http://127.0.0.1:5001/fast-notion/asia-northeast1/v3/update-status",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        databaseId,
        token,
        pageTitle: title,
        statusPropertyId,
        statusOptionId,
        datePropertyId,
        mode: "COMPLETE",
      }),
    }
  );
  console.log("complete", result);
};

/** Chrome のストレージに入っている情報を取得 */
const getStorageData = () => {
  chrome.storage.sync.get(
    [
      "token",
      "databaseId",
      "statusPropertyId",
      "statusOptionId",
      "datePropertyId",
    ],
    (items) => {
      databaseId = items.databaseId;
      token = items.token;
      statusPropertyId = items.statusPropertyId;
      statusOptionId = items.statusOptionId;
      datePropertyId = items.datePropertyId;
    }
  );
};

/** 設定画面を開く */
const openOptionsPage = () => {
  chrome.runtime.sendMessage({ action: "openOptionsPage" });
};
