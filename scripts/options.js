$(document).ready(() => {
  $(".select-status").select2();
  $(".select-option").select2();
  $(".select-date").select2();

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

  $("#readProperties").on("click", (e) => {
    console.log("e", e);
    alert("read");
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
