$(document).ready(() => {
  $("#statusPropertyId").select2();
  $("#statusOptionId").select2();
  $("#datePropertyId").select2();

  // 設定をフォームに読み込む
  chrome.storage.sync.get(
    [
      "token",
      "databaseId",
      "statusPropertyId",
      "statusOptionId",
      "datePropertyId",
    ],
    (items) => {
      $("#token").val(items.token);
      $("#databaseId").val(items.databaseId);
      $("#statusPropertyId").val(items.status);
      $("#statusOptionId").val(items.status);
      $("#datePropertyId").val(items.date);
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
      "http://127.0.0.1:5001/fast-notion/asia-northeast1/v3/database",
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

    if (databaseRes.statusProperties.length > 0) {
      const statusOptions = databaseRes.statusProperties.map((_) => ({
        id: _.id,
        text: _.name,
      }));
      $("#statusPropertyId").select2({ data: statusOptions });

      const options = databaseRes.statusProperties[0].completeGroup.options.map(
        (_) => ({
          id: _.id,
          text: _.name,
        })
      );
      $("#statusOptionId").select2({ data: options });
    }
    const dateOptions = databaseRes.dateProperties.map((_) => ({
      id: _.id,
      text: _.name,
    }));
    $("#datePropertyId").select2({ data: dateOptions });
  });

  // ステータスプロパティの変更に応じて、オプションプロパティの選択肢を更新する
  $("#statusPropertyId").on("select2:select", (e) => {
    const data = e.params.data;
    const newOptions = databaseRes.statusProperties
      .filter((_) => _.id === data.id)[0]
      .completeGroup.options.map((_) => ({ id: _.id, text: _.name }));

    // 古いオプションが残り続けないように、一度全て削除する
    $("#statusOptionId").children().remove();
    $("#statusOptionId").select2({ data: newOptions });
  });

  // フォームのサブミットをハンドル
  $("#settingsForm").submit((event) => {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    // 入力値を取得
    var token = $("#token").val();
    var databaseId = $("#databaseId").val();
    var statusPropertyId = $("#statusPropertyId").val();
    var statusOptionId = $("#statusOptionId").val();
    var datePropertyId = $("#datePropertyId").val();

    // 設定を保存
    chrome.storage.sync.set(
      {
        token,
        databaseId,
        statusPropertyId,
        statusOptionId,
        datePropertyId,
      },
      () => {
        // 保存が完了したら、何らかのフィードバックをユーザーに提供する
        alert("設定が保存されました。");
        window.close();
      }
    );
  });
});
