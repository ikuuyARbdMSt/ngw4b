"use strict";

document.addEventListener("DOMContentLoaded", () => {
  toggleSwitch();
  optBtn();
});

// トグルスイッチを作成する関数
function toggleSwitch() {
  // ステータスの取得
  chrome.storage.sync.get("ngw4b_status", function (items) {
    let status = items.ngw4b_status;
    if (status === undefined) {
      status = true;
      chrome.storage.sync.set({ ngw4b_status: status });
    }
    // トグルスイッチ要素の取得
    const toggleSwitch = document.getElementById("toggleSwitch");
    // ステータス表示テキストを作成
    const statusText = document.createElement("div");
    statusText.id = "statusText";
    // 初期状態
    toggleSwitch.checked = status;
    const enable_str = chrome.i18n.getMessage("PopupStatusEnabled");
    const disable_str = chrome.i18n.getMessage("PopupStatusDisabled");
    const enable_color = "blue";
    const disable_color = "red";
    if (status) {
      statusText.textContent = enable_str;
      statusText.style.color = enable_color;
    } else {
      statusText.textContent = disable_str;
      statusText.style.color = disable_color;
    }
    // ステータス表示テキストを追加
    const toggleStatus = document.getElementById("toggleStatus");
    toggleStatus.appendChild(statusText);
    // 状態変更時のイベントリスナー
    toggleSwitch.addEventListener("change", function () {
      if (this.checked) {
        status = true;
        statusText.textContent = enable_str;
        statusText.style.color = enable_color;
      } else {
        status = false;
        statusText.textContent = disable_str;
        statusText.style.color = disable_color;
      }
      chrome.storage.sync.set({ ngw4b_status: status });
    });
  });
}

// オプションボタンを作成する関数
function optBtn() {
  // オプション画面へのリンクを追加
  const link = document.createElement("a");
  link.textContent = chrome.i18n.getMessage("PopupOptBtn");
  link.href = `extension://${chrome.runtime.id}/html/options.html`;
  link.id = "optBtn";
  link.setAttribute("name", "newtab");
  const container = document.getElementById("container");
  container.appendChild(link);
  // リンクをクリックしたときにタブを開くようにする
  const links = document.getElementsByName("newtab");
  for (var i = 0; i < links.length; i++) {
    (function () {
      var ln = links[i];
      var location = ln.href;
      ln.onclick = function () {
        chrome.tabs.create({ active: true, url: location });
      };
    })();
  }
}
