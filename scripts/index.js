/** 遅延 */
const DELAY_TIME = 300;

/** ボタンスタイル */
const BUTTON_STYLES = `
  font-size: 11px;
  margin-left: 6px;
`;

/** Containerスタイル */
const CONTAINER_STYLES = `
  font-size: 11px;
  margin-top: 8px;
  gap: 6px;
`;

const buildSettingButton = (className) => `
  <button style="${BUTTON_STYLES}" class="${className}" id="settingButton">設定</button>
`;

const buildActionButtons = (divClassName, buttonClassName) => `
  <div style="${CONTAINER_STYLES}" class="${divClassName}" id="actionButtons">
    <button class="${buttonClassName}" id="startButton">開始</button>
    <button class="${buttonClassName}" id="completeButton">完了</button>
  </div>
`;

/** Notion の情報 */
let databaseId = "";
let token = "";
let statusPropertyId = "";
let statusOptionId = "";
let datePropertyId = "";

/** 即時実行 */
$(document).ready(() => {
  appendSettingButton();
  appendActionButtons();
  getStorageData();

  // イベントリスナを登録
  $(document).on("click", appendSettingButton);
  $(document).on("click", appendActionButtons);
  $(document).on("click", "#settingButton", openOptionsPage);
  $(document).on("click", "#startButton", () => onClick("START"));
  $(document).on("click", "#completeButton", () => onClick("COMPLETE"));
});

/** 設定ボタンを追加する */
const appendSettingButton = () => {
  setTimeout(() => {
    if ($("#settingButton").length > 0) return;
    const button = $("div:contains('Notionで開く')").parent("button");
    const parent = button.parent();
    const className = button.attr("class");
    parent.append(buildSettingButton(className));
  }, DELAY_TIME);
};

/** 開始・完了ボタンを追加する */
const appendActionButtons = () => {
  setTimeout(() => {
    if ($("#actionButtons").length > 0) return;
    const button = $("div:contains('Notionで開く')").parent("button");
    const parent = button.parent();
    const targetRoot = parent.parent();
    targetRoot.append(
      buildActionButtons(parent.attr("class"), button.attr("class"))
    );
  }, DELAY_TIME);
};

/** ボタンをクリックした際のイベントハンドラ */
const onClick = (action) => {
  // Notion の接続情報が設定されていない場合は、設定画面を開く
  if (!databaseId || !token) {
    openOptionsPage();
    return;
  }

  const title = $("div:contains('イベント')").find("p").text();
  action === "START" ? start(title) : complete(title);
};

const start = async () => {
  await fetch(
    "https://fd8d-2400-2410-9501-ac00-40ed-d0e1-82ab-9130.ngrok-free.app/fast-notion/asia-northeast1/v3/update-status",
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
        mode: "START",
      }),
    }
  );
};

const complete = async (title) => {
  await fetch(
    "https://fd8d-2400-2410-9501-ac00-40ed-d0e1-82ab-9130.ngrok-free.app/fast-notion/asia-northeast1/v3/update-status",
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
