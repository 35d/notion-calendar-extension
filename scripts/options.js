$(document).ready(() => {
  // 設定をフォームに読み込む
  chrome.storage.sync.get(["token", "databaseId", "status", "date"], (items) => {
    $("#token").val(items.token);
    $("#databaseId").val(items.databaseId);
    $("#status").val(items.status);
    $("#date").val(items.date);
  });

  // フォームのサブミットをハンドル
  $("#settingsForm").submit((event) => {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    // 入力値を取得
    var token = $("#token").val();
    var databaseId = $("#databaseId").val();
    var status = $("#status").val();
    var date = $("#date").val();

    // TODO: 入力値のバリデーション
    // 一度リクエストを飛ばし、正しい ID とトークンかを確認する

    // 設定を保存
    chrome.storage.sync.set(
      {
        token: token,
        databaseId: databaseId,
        status: status,
        date: date,
      },
      () => {
        // 保存が完了したら、何らかのフィードバックをユーザーに提供する
        alert("設定が保存されました。");
        window.close();
      },
    );
  });
});
