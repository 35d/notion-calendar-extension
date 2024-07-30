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

/** 言語設定を取得 */
const lang = $("html").attr("lang");

/** ボタンのテキスト名を定義 */
const buttonText = lang === "ja" ? "Notionで開く" : "Open in Notion";

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
let startStatusPropertyId = "";
let startStatusOptionId = "";
let startDatePropertyId = "";
let completeStatusPropertyId = "";
let completeStatusOptionId = "";
let completeDatePropertyId = "";
let db;

/** 即時実行 */
$(document).ready(() => {
  appendSettingButton();
  appendActionButtons();
  getStorageData();

  // イベントリスナを登録
  $(document).on("click", appendSettingButton);
  $(document).on("click", appendActionButtons);
  $(document).on("click", "#settingButton", openOptionsPage);
  $(document).on("click", "#startButton", function () {
    onClick("START", this);
  });
  $(document).on("click", "#completeButton", function () {
    onClick("COMPLETE", this);
  });

  chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
      // プロパティの設定が完了した際に発火し、設定の再読み込みを行う
      case "syncStorage":
        getStorageData();
        break;
      default:
        break;
    }
  });

  const request = window.indexedDB.open("cron");
  request.onsuccess = (event) => {
    db = event.target.result;
  };
});

/** 設定ボタンを追加する */
const appendSettingButton = () => {
  setTimeout(() => {
    if ($("#settingButton").length > 0) return;
    const button = $(`div:contains('${buttonText}')`).parent("button");
    const parent = button.parent();
    const className = button.attr("class");
    parent.append(buildSettingButton(className));
  }, DELAY_TIME);
};

/** 開始・完了ボタンを追加する */
const appendActionButtons = () => {
  setTimeout(() => {
    if ($("#actionButtons").length > 0) return;
    const button = $(`div:contains('${buttonText}')`).parent("button");
    const parent = button.parent();
    const targetRoot = parent.parent();
    targetRoot.append(buildActionButtons(parent.attr("class"), button.attr("class")));
  }, DELAY_TIME);
};

const CALENDAR_EVENT_STORE_NAME = "CalendarEvent";
/** ボタンをクリックした際のイベントハンドラ */
const onClick = async (action, elm) => {
  // Notion の接続情報が設定されていない場合は、設定画面を開く
  if (!databaseId || !token) {
    openOptionsPage();
    return;
  }

  $(elm).text("更新中...");
  $(elm).prop("disabled", true);

  try {
    const title = $("div:contains('イベント')").find("p").text();
    const getAllReq = db.transaction([CALENDAR_EVENT_STORE_NAME]).objectStore(CALENDAR_EVENT_STORE_NAME).getAll();
    getAllReq.onsuccess = async () => {
      try {
        const target = getAllReq.result.find((_) => _.summary === title);
        if (!target) throw new Error("更新対象のイベントが見つけられませんでした");

        const id = target.id;
        action === "START" ? await start(id, title) : await complete(id, title);

        const clearReq = db.transaction([CALENDAR_EVENT_STORE_NAME], "readwrite").objectStore(CALENDAR_EVENT_STORE_NAME).clear();
        clearReq.onsuccess = () => {
          location.reload();
        };
      } catch (e) {
        handleError(e, action, elm);
      }
    };
  } catch (e) {
    handleError(e, action, elm);
  }
};

const handleError = (e, action, elm) => {
  alert("更新に失敗しました");
  console.error(e);
  $(elm).text(action === "START" ? "開始" : "完了");
  $(elm).prop("disabled", false);
};

const API_UPDATE_STATUS_URL = "https://asia-northeast1-fast-notion.cloudfunctions.net/v3/update-status";

const start = async (id, title) => {
  await fetch(API_UPDATE_STATUS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      databaseId,
      token,
      id,
      pageTitle: title,
      statusPropertyId: startStatusPropertyId,
      statusOptionId: startStatusOptionId,
      datePropertyId: startDatePropertyId,
      mode: "START",
    }),
  });
};

const complete = async (id, title) => {
  await fetch(API_UPDATE_STATUS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      databaseId,
      token,
      id,
      pageTitle: title,
      statusPropertyId: completeStatusPropertyId,
      statusOptionId: completeStatusOptionId,
      datePropertyId: completeDatePropertyId,
      mode: "COMPLETE",
    }),
  });
};

/** Chrome のストレージに入っている情報を取得 */
const getStorageData = () => {
  chrome.storage.sync.get(
    [
      "token",
      "databaseId",
      "startStatusPropertyId",
      "startStatusOptionId",
      "startDatePropertyId",
      "completeStatusPropertyId",
      "completeStatusOptionId",
      "completeDatePropertyId",
    ],
    (items) => {
      databaseId = items.databaseId;
      token = items.token;
      startStatusPropertyId = items.startStatusPropertyId;
      startStatusOptionId = items.startStatusOptionId;
      startDatePropertyId = items.startDatePropertyId;
      completeStatusPropertyId = items.completeStatusPropertyId;
      completeStatusOptionId = items.completeStatusOptionId;
      completeDatePropertyId = items.completeDatePropertyId;
    },
  );
};

/** 設定画面を開く */
const openOptionsPage = () => {
  chrome.runtime.sendMessage({ action: "openOptionsPage" });
};
