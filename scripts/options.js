$(document).ready(() => {
  $("#startStatusPropertyId").select2();
  $("#startStatusOptionId").select2();
  $("#startDatePropertyId").select2();
  $("#completeStatusPropertyId").select2();
  $("#completeStatusOptionId").select2();
  $("#completeDatePropertyId").select2();

  // API から取得したデータベースの情報格納用
  let databaseRes;

  const fetchDatabase = async () => {
    const token = $("#token").val();
    const databaseId = $("#databaseId").val();
    if (!token || !databaseId) {
      alert("トークンまたはデータベースIDが入力されていません。");
      return;
    }
    const result = await fetch(
      "https://asia-northeast1-fast-notion.cloudfunctions.net/v3/database",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          databaseId,
        }),
      }
    );
    databaseRes = await result.json();
  };

  // トークン・データベースIDを入力後、手動で同期をした際に呼ばれる処理
  const initSelect = async () => {
    await fetchDatabase();
    const statusProperties = databaseRes.statusProperties;
    if (statusProperties.length > 0) {
      const statusOptions = statusProperties.map((_) => ({
        id: _.id,
        text: _.name,
      }));
      $("#startStatusPropertyId").select2({ data: statusOptions });
      $("#completeStatusPropertyId").select2({ data: statusOptions });

      const inProgressGroupOptions =
        statusProperties[0].inProgressGroup.options.map((_) => ({
          id: _.id,
          text: _.name,
        }));
      $("#startStatusOptionId").select2({ data: inProgressGroupOptions });
      const completeGroupOptions =
        statusProperties[0].completeGroup.options.map((_) => ({
          id: _.id,
          text: _.name,
        }));
      $("#completeStatusOptionId").select2({ data: completeGroupOptions });
    }
    const dateOptions = databaseRes.dateProperties.map((_) => ({
      id: _.id,
      text: _.name,
    }));
    $("#startDatePropertyId").select2({ data: dateOptions });
    $("#completeDatePropertyId").select2({ data: dateOptions });
  };

  // すでに設定済みの情報を復元する処理
  const resolveSelect = async (
    startStatusPropertyId,
    startStatusOptionId,
    startDatePropertyId,
    completeStatusPropertyId,
    completeStatusOptionId,
    completeDatePropertyId
  ) => {
    await fetchDatabase();
    const statusProperties = databaseRes.statusProperties;
    if (statusProperties.length > 0) {
      const startStatusOptions = statusProperties.map((_) => ({
        text: _.name,
        id: _.id,
        selected: _.id === startStatusPropertyId,
      }));
      $("#startStatusPropertyId").select2({ data: startStatusOptions });

      const completeStatusOptions = statusProperties.map((_) => ({
        text: _.name,
        id: _.id,
        selected: _.id === completeStatusPropertyId,
      }));
      $("#completeStatusPropertyId").select2({ data: completeStatusOptions });

      const targetStartStatus = statusProperties.find(
        (_) => _.id === startStatusPropertyId
      );
      const inProgressGroupOptions =
        targetStartStatus.inProgressGroup.options.map((_) => ({
          text: _.name,
          id: _.id,
          selected: _.id === startStatusOptionId,
        }));
      $("#startStatusOptionId").select2({ data: inProgressGroupOptions });

      const targetCompleteStatus = statusProperties.find(
        (_) => _.id === completeStatusPropertyId
      );
      const completeGroupOptions =
        targetCompleteStatus.completeGroup.options.map((_) => ({
          text: _.name,
          id: _.id,
          selected: _.id === completeStatusOptionId,
        }));
      $("#completeStatusOptionId").select2({ data: completeGroupOptions });
    }
    const startDateOptions = databaseRes.dateProperties.map((_) => ({
      text: _.name,
      id: _.id,
      selected: _.id === startDatePropertyId,
    }));
    $("#startDatePropertyId").select2({ data: startDateOptions });

    const completeDateOptions = databaseRes.dateProperties.map((_) => ({
      text: _.name,
      id: _.id,
      selected: _.id === completeDatePropertyId,
    }));
    $("#completeDatePropertyId").select2({ data: completeDateOptions });
  };

  // 設定をフォームに読み込む
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
      "shouldReload", // boolean
    ],
    async (items) => {
      $("#token").val(items.token);
      $("#databaseId").val(items.databaseId);
      $("#shouldReload").prop("checked", items.shouldReload === true);
      if (items.token && items.databaseId && items.startStatusPropertyId) {
        await resolveSelect(
          items.startStatusPropertyId,
          items.startStatusOptionId,
          items.startDatePropertyId,
          items.completeStatusPropertyId,
          items.completeStatusOptionId,
          items.completeDatePropertyId,
        );
      }
    },
  );

  $("#readProperties").on("click", initSelect);

  // ステータスプロパティの変更に応じて、オプションプロパティの選択肢を更新する
  $("#startStatusPropertyId").on("select2:select", (e) => {
    const data = e.params.data;
    const newOptions = databaseRes.statusProperties
      .filter((_) => _.id === data.id)[0]
      .inProgressGroup.options.map((_) => ({ id: _.id, text: _.name }));

    // 古いオプションが残り続けないように、一度全て削除する
    $("#startStatusOptionId").children().remove();
    $("#startStatusOptionId").select2({ data: newOptions });
  });

  // ステータスプロパティの変更に応じて、オプションプロパティの選択肢を更新する
  $("#completeStatusPropertyId").on("select2:select", (e) => {
    const data = e.params.data;
    const newOptions = databaseRes.statusProperties
      .filter((_) => _.id === data.id)[0]
      .completeGroup.options.map((_) => ({ id: _.id, text: _.name }));

    // 古いオプションが残り続けないように、一度全て削除する
    $("#completeStatusOptionId").children().remove();
    $("#completeStatusOptionId").select2({ data: newOptions });
  });

  // フォームのサブミットをハンドル
  $("#settingsForm").submit((event) => {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    // 入力値を取得
    var token = $("#token").val();
    var databaseId = $("#databaseId").val();
    var startStatusPropertyId = $("#startStatusPropertyId").val();
    var startStatusOptionId = $("#startStatusOptionId").val();
    var startDatePropertyId = $("#startDatePropertyId").val();
    var completeStatusPropertyId = $("#completeStatusPropertyId").val();
    var completeStatusOptionId = $("#completeStatusOptionId").val();
    var completeDatePropertyId = $("#completeDatePropertyId").val();

    // 設定を保存
    chrome.storage.sync.set(
      {
        token,
        databaseId,
        startStatusPropertyId,
        startStatusOptionId,
        startDatePropertyId,
        completeStatusPropertyId,
        completeStatusOptionId,
        completeDatePropertyId,
        shouldReload,
      },
      () => {
        // 保存が完了したら、何らかのフィードバックをユーザーに提供する
        chrome.runtime.sendMessage({ action: "completeSetting" });
        alert("設定が保存されました。");
        window.close();
      }
    );
  });
});
