"use strict";

// テキストエリアに保存済みの内容を表示する
const textarea_nglist = document.getElementById("nglist");
chrome.storage.sync.get("ngw4b_nglist", function (items) {
  if (items.ngw4b_nglist !== undefined) {
    textarea_nglist.value = items.ngw4b_nglist;
  }
});

// テキストエリアの内容が変更されたら自動保存するようにする
nglist.addEventListener("input", function () {
  // テキストエリアからデータを取得
  let nglist = textarea_nglist.value ?? "";
  // データを小文字に変換
  nglist = nglist.toLowerCase();
  // データから空行を削除
  nglist = nglist.replace(/\n{2,}/g, "\n");
  nglist = nglist.replace(/\n$/, "");
  // データから先頭と末尾の空白を削除
  nglist = nglist.replace(/^(\s|　)+|(\s|　)+$/g, "");
  nglist = nglist.replace(/\n(\s|　)+|(\s|　)+\n/g, "\n");
  // NGリストから重複を削除
  const nglist_array = nglist.split("\n");
  const nglist_array_unique = [...new Set(nglist_array)];
  nglist = nglist_array_unique.join("\n");
  // ストレージに保存
  chrome.storage.sync.set({ ngw4b_nglist: nglist });
});

// 説明文
const optTitle = document.getElementById("OptTitle");
optTitle.textContent = chrome.i18n.getMessage("Name") + " - " + "Options";
const pageTitle = document.getElementById("PageTitle");
pageTitle.textContent = chrome.i18n.getMessage("Name") + " - " + "Options";
const ngListHeader = document.getElementById("NGListHeader");
ngListHeader.textContent = chrome.i18n.getMessage("NGListHeader");
const ngListDesc = document.getElementById("NGListDesc");
ngListDesc.textContent = chrome.i18n.getMessage("NGListDesc");
const optListHeader = document.getElementById("OptListHeader");
optListHeader.textContent = chrome.i18n.getMessage("OptListHeader");
const optListDesc1 = document.getElementById("OptListDesc1");
optListDesc1.textContent = chrome.i18n.getMessage("OptListDesc1");
const optListDesc2 = document.getElementById("OptListDesc2");
optListDesc2.textContent = chrome.i18n.getMessage("OptListDesc2");
