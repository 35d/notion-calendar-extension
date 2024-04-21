$(document).ready(() => {
  $("#startStatusPropertyId").select2();
  $("#startStatusOptionId").select2();
  $("#startDatePropertyId").select2();
  $("#completeStatusPropertyId").select2();
  $("#completeStatusOptionId").select2();
  $("#completeDatePropertyId").select2();

  {
    token,
      databaseId,
      startStatusPropertyId,
      startStatusOptionId,
      startDatePropertyId,
      completeStatusPropertyId,
      completeStatusOptionId,
      completeDatePropertyId;
  }

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
    ],
    (items) => {
      $("#token").val(items.token);
      $("#databaseId").val(items.databaseId);
      $("#startStatusPropertyId").val(items.startStatusPropertyId);
      $("#startStatusOptionId").val(items.startStatusOptionId);
      $("#startDatePropertyId").val(items.startDatePropertyId);
      $("#completeStatusPropertyId").val(items.completeStatusPropertyId);
      $("#completeStatusOptionId").val(items.completeStatusOptionId);
      $("#completeDatePropertyId").val(items.completeDatePropertyId);
    }
  );

  // API から取得したデータベースの情報格納用
  let databaseRes;

  $("#readProperties").on("click", async (e) => {
    const token = $("#token").val();
    const databaseId = $("#databaseId").val();
    if (!token || !databaseId) {
      alert("トークンまたはデータベースIDが入力されていません。");
      return;
    }
    const result = await fetch(
      "https://fd8d-2400-2410-9501-ac00-40ed-d0e1-82ab-9130.ngrok-free.app/fast-notion/asia-northeast1/v3/database",
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
    initSelect();
  });

  const initSelect = () => {
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
      },
      () => {
        // 保存が完了したら、何らかのフィードバックをユーザーに提供する
        alert("設定が保存されました。");
        window.close();
      }
    );
  });
});
