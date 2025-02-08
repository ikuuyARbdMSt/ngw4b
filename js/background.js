"use strict";

// コンテキストメニューの作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ngw4b_captureText",
    title:
      chrome.i18n.getMessage("Name") +
      " - " +
      chrome.i18n.getMessage("ContextMenuLabel"),
    contexts: ["selection"],
  });
});

// コンテキストメニューがクリックされたときの処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ngw4b_captureText" && info.selectionText) {
    handleSelectedText(info.selectionText, tab);
  }
});

// 選択テキストの処理
function handleSelectedText(selectedText, tab) {
  // content.jsの関数を呼び出す
  chrome.tabs.sendMessage(
    tab.id,
    {
      action: "executeFunction",
      selectionText: selectedText,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        // エラーハンドリング（content.jsが読み込まれていない場合など）
        console.error("Message failed:", chrome.runtime.lastError);
        return;
      }
      console.log(response?.status);
    }
  );
}
