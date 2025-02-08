"use strict";

// DOMが読み込まれた後に実行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", afterDOMLoaded);
}
function afterDOMLoaded() {
  // NGリストを取得する
  chrome.storage.sync.get("ngw4b_nglist", function (items) {
    // 各キーワードごとに処理
    if (items.ngw4b_nglist.length > 0) {
      const ngw4b_nglist_lst = items.ngw4b_nglist.split(/\n/);
      for (let i = 0; i < ngw4b_nglist_lst.length; i++) {
        const word = ngw4b_nglist_lst[i];
        exe_rmNG(word);
      }
    }
  });
}

// コンテキストメニューが押されたときに実行
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "executeFunction") {
    exe_ContextMenu(request.selectionText);
    sendResponse({ status: "success" });
  }
  return true;
});
function exe_ContextMenu(selectionText) {
  // 選択テキストを小文字に変換
  selectionText = selectionText.toLowerCase();
  // 選択テキストから余分な空白を削除
  selectionText = selectionText.replace(/^(\s|　)+|(\s|　)+$/g, "");
  selectionText = selectionText.replace(/\n(\s|　)+|(\s|　)+\n/g, "\n");
  // ポップアップウィンドウを作成する
  const overlay = document.createElement("div");
  overlay.id = "ngw4b_overlay";
  const popup = document.createElement("div");
  popup.id = "ngw4b_popup";
  const popup_content = document.createElement("div");
  popup_content.id = "ngw4b_popup-content";
  const popup_title = document.createElement("h2");
  popup_title.textContent = chrome.i18n.getMessage("Name");
  const popup_message = document.createElement("p");
  popup_message.textContent =
    chrome.i18n.getMessage("ContextMenu_PopupWindow_Message") +
    ` "${selectionText}"`;
  const ok_button = document.createElement("button");
  ok_button.textContent = chrome.i18n.getMessage("ContextMenu_PopupWindow_Yes");
  ok_button.id = "ngw4b_ok-btn";
  const no_button = document.createElement("button");
  no_button.textContent = chrome.i18n.getMessage("ContextMenu_PopupWindow_No");
  no_button.id = "ngw4b_no-btn";
  popup_content.appendChild(popup_title);
  popup_content.appendChild(popup_message);
  popup.appendChild(popup_content);
  popup.appendChild(ok_button);
  popup.appendChild(no_button);
  document.body.appendChild(overlay);
  document.body.appendChild(popup);
  const style = document.createElement("style");
  style.id = "ngw4b_style";
  style.textContent = `
    #ngw4b_overlay {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }

    /* ポップアップウィンドウ */
    #ngw4b_popup {
        display: block;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        min-width: 300px;
    }

    /* ポップアップコンテンツ */
    #ngw4b_popup-content {
        margin-bottom: 40px;
    }

    /* OKボタン */
    #ngw4b_ok-btn {
        position: absolute;
        right: 120px;
        bottom: 10px;
        padding: 8px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    #ngw4b_ok-btn:hover {
        background-color: #0056b3;
    }

    /* NOボタン */
    #ngw4b_no-btn {
        position: absolute;
        right: 20px;
        bottom: 10px;
        padding: 8px 20px;
        background-color:rgb(255, 0, 55);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    #ngw4b_no-btn:hover {
        background-color: rgb(156, 7, 39);
    }
  `;
  document.body.appendChild(style);
  // ポップアップウィンドウのボタンがクリックされたら、ポップアップウィンドウを閉じる
  ok_button.addEventListener("click", ngw4b_closePopup);
  no_button.addEventListener("click", ngw4b_closePopup);
  // OKボタンがクリックされたら、選択テキストをNGワードに追加する
  ok_button.addEventListener("click", () => {
    // 現在のNGリストを取得
    chrome.storage.sync.get("ngw4b_nglist", function (items) {
      let nglist = "";
      if (items.ngw4b_nglist !== undefined && items.ngw4b_nglist !== "") {
        nglist = items.ngw4b_nglist + "\n";
      }
      // NGリストに選択テキストを追加
      nglist += selectionText;
      // NGリストから重複を削除
      const nglist_array = nglist.split("\n");
      const nglist_array_unique = [...new Set(nglist_array)];
      nglist = nglist_array_unique.join("\n");
      // NGリストを保存
      chrome.storage.sync.set({ ngw4b_nglist: nglist });
    });
    // 削除処理の実行
    exe_rmNG(selectionText);
  });
  // ポップアップウィンドウを閉じる関数
  function ngw4b_closePopup() {
    document.getElementById("ngw4b_overlay").remove();
    document.getElementById("ngw4b_popup").remove();
    document.getElementById("ngw4b_style").remove();
  }
}

// 削除処理の実行
function exe_rmNG(word) {
  // ステータスを取得
  chrome.storage.sync.get("ngw4b_status", function (items) {
    let status = items.ngw4b_status;
    if (status === undefined) {
      status = true;
      chrome.storage.sync.set({ ngw4b_status: status });
    }
    if (status) {
      // 検索ワードにオプションが含まれているかを判定する正規表現パターン。
      const word_opt_pattern = /\[[^\]]+\]$/;
      // 検索ワードからオプションを抽出する。
      const word_opt_match = word.match(word_opt_pattern);
      // 検索ワードにオプションが含まれている場合、そのオプションを処理する。
      let isRegex = false;
      let isTitle = false;
      if (word_opt_match !== null) {
        const word_opt = word_opt_match[0].replace(/^\[|\]$/g, "");
        const word_opt_lst = word_opt.split(",");
        // オプション配列から不要な空白を除去する。
        for (let i = 0; i < word_opt_lst.length; i++) {
          word_opt_lst[i] = word_opt_lst[i].trim();
        }
        // regexが指定されている場合、正規表現として検索を行う。
        if (word_opt_lst.includes("regex")) {
          isRegex = true;
        }
        // titleが指定されている場合、タイトルのみを検索対象とする。
        if (word_opt_lst.includes("title")) {
          isTitle = true;
        }
        // オプションを削除して、検索ワードのみにする。
        word = word.replace(word_opt_pattern, "");
      }
      // 開いているページを判定
      const currentURL = window.location.href;
      const pattern_img = /^https:\/\/www\.bing\.com\/images\//;
      const pattern_news = /^https:\/\/www\.bing\.com\/news\//;
      const pattern_shop = /^https:\/\/www\.bing\.com\/shop\?/;
      // 削除処理
      if (pattern_img.test(currentURL)) {
        // Bing画像検索の場合
        rmNG_img(word, isRegex);
      } else if (pattern_news.test(currentURL)) {
        // Bingニュースの場合
        rmNG_news(word, isRegex, isTitle);
      } else if (pattern_shop.test(currentURL)) {
        // Bingショップの場合
        rmNG_shop(word, isRegex);
      } else {
        // 通常の検索結果の場合
        rmNG_main(word, isRegex, isTitle);
        rmNG_main_cleaning();
      }
    }
  });
}

// 引数の文字列を含む通常検索結果を削除する
function rmNG_main(word, isRegex, isTitle) {
  // 正規表現オプションが指定されている場合の処理。
  if (isRegex) {
    // 検索するタグを指定する。
    const searchElems = document.querySelectorAll("p, a, div, span");
    const searchElemsLst = Array.from(searchElems);
    // 正規表現パターンを作成する。
    const regexPattern = new RegExp(word, "i");
    // 各要素に対して正規表現で検索して処理。
    searchElemsLst.forEach((searchElem) => {
      const tagName = searchElem.nodeName;
      const classNames = Array.from(searchElem.classList);
      let targetElemExpr = "";
      let isDeleted = false;
      // テキストノードに対して正規表現で検索する。
      for (let elem of searchElem.childNodes) {
        if (
          elem.nodeName === "#text" &&
          regexPattern.test(elem.nodeValue.trim())
        ) {
          let isDesc = false;
          if (tagName === "P" && !classNames.includes("na_t")) {
            isDesc = true;
          } else if (tagName === "SPAN" && classNames.includes("df_alsocon")) {
            isDesc = true;
          } else if (
            tagName === "DIV" &&
            (classNames.includes("b_gwaDlSnippet") ||
              classNames.includes("feeditem_snippet") ||
              classNames.includes("df_qntext"))
          ) {
            isDesc = true;
          } else if (tagName === "A") {
            const parent = searchElem.parentNode;
            const parent_classNames = Array.from(parent.classList);
            if (parent_classNames.includes("b_gwaText")) {
              isDesc = true;
            }
          }
          if ((isTitle && !isDesc) || !isTitle) {
            targetElemExpr =
              "li.b_algo, div.slide, li:has(div.sb_add), div.na_card_wrp";
          }
        }
      }
      // aタグのaria-label属性に対して正規表現で検索する。
      if (!targetElemExpr) {
        const attr = searchElem.getAttribute("aria-label");
        if (
          tagName === "A" &&
          attr !== null &&
          regexPattern.test(attr.trim())
        ) {
          targetElemExpr =
            "li.b_algo, div.slide, div:has(div.mc_vtvc), div.na_card_wrp";
        }
      }
      // 正規表現でマッチした検索結果を削除する。
      if (targetElemExpr) {
        const targetElem = searchElem.closest(targetElemExpr);
        if (targetElem !== null) {
          targetElem.remove();
          isDeleted = true;
        }
      }
      // divタグの属性に対して正規表現で検索して削除
      if (!isDeleted) {
        const attr1 = searchElem.getAttribute("data-displayname");
        const attr2 = searchElem.getAttribute("data-title");
        if (
          tagName === "DIV" &&
          ((attr1 !== null && regexPattern.test(attr1.trim())) ||
            (attr2 !== null && regexPattern.test(attr2.trim())))
        ) {
          searchElem.remove();
          isDeleted = true;
        }
      }
    });
  } else {
    // 大文字小文字区別しないようにするための変数定義とtranslate関数の使用に必要。
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    // Xpath式
    const contains_text =
      `contains(` +
      `translate(./text(),'${uppercase}','${lowercase}'),'${word}'` +
      `)` +
      ` or strong[` +
      `contains(` +
      `translate(./text(),'${uppercase}','${lowercase}'),'${word}'` +
      `)` +
      `]`;
    const a_arialabel =
      `a[contains(` +
      `translate(` +
      `@aria-label,'${uppercase}','${lowercase}'` +
      `)` +
      `,'${word}'` +
      `)]`;
    const xpath1 = // 通常結果の説明文
      `//li[contains(@class, 'b_algo')]` +
      `[.//a[${contains_text}] or .//${a_arialabel}]`;
    const xpath2 = // スライド
      `//div[starts-with(@class, 'slide')][` +
      `.//span[not(@class='df_alsocon')][${contains_text}]` +
      ` or .//${a_arialabel}` +
      ` or .//div[` +
      `not(@class='b_gwaDlSnippet')` +
      ` and not(@class='feeditem_snippet')` +
      ` and not(@class='df_qntext')` +
      `]` +
      `[${contains_text}]` +
      `]`;
    const xpath3 = `//div[div[contains(@class,'mc_vtvc')]/${a_arialabel}]`; // 動画
    const xpath4 = `//li[div[contains(@class, 'sb_add')]//a[${contains_text}]]`; // 広告
    const xpath5 = // ニュース
      `//div[contains(@class, "na_card_wrp")]` +
      `[.//p[${contains_text}] or .//${a_arialabel}]`;
    const xpath6 =
      `//div[` +
      `contains(` +
      `translate(@data-displayname` +
      `,'${uppercase}','${lowercase}'),'${word}'` +
      `)` +
      ` or contains(` +
      `translate(@data-title` +
      `,'${uppercase}','${lowercase}'),'${word}'` +
      `)` +
      `]`;
    let xpaths = `${xpath1}|${xpath2}|${xpath3}|${xpath4}|${xpath5}|${xpath6}`;
    if (!isTitle) {
      // 通常結果の説明文
      const xpath_desc1 = `//li[contains(@class, 'b_algo')][.//p[${contains_text}]]`;
      const xpath_desc2 = // スライド
        `//div[starts-with(@class, 'slide')][` +
        `.//a[${contains_text}]` +
        ` or .//div[` +
        `(@class='b_gwaDlSnippet')` +
        ` or (@class='feeditem_snippet')` +
        ` or (@class='df_qntext')` +
        `]` +
        `[${contains_text}]` +
        `]`;
      xpaths += `|${xpath_desc1}|${xpath_desc2}`;
    }
    // xpathを使って検索
    const xpaths_result = document.evaluate(
      xpaths,
      document,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    // xpathの結果を使って要素を削除
    for (let i = 0; i < xpaths_result.snapshotLength; i++) {
      const node = xpaths_result.snapshotItem(i);
      node.remove();
    }
  }
}

// 空になった部分の削除
function rmNG_main_cleaning() {
  const xpath1 = `//div[starts-with(@class,'slide')][not(*)]`;
  const xpaths = `${xpath1}`;
  const result = document.evaluate(
    xpaths,
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0; i < result.snapshotLength; i++) {
    const node = result.snapshotItem(i);
    node.remove();
  }
}

// 引数の文字列を含む画像検索結果を削除する
function rmNG_img(word, isRegex) {
  // 正規表現オプションが指定されている場合の処理。
  if (isRegex) {
    // 検索するタグを指定する。
    const searchElems = document.querySelectorAll("a");
    const searchElemsLst = Array.from(searchElems);
    // 正規表現パターンを作成する。
    const regexPattern = new RegExp(word, "i");
    // 各要素に対して正規表現で検索して処理。
    searchElemsLst.forEach((searchElem) => {
      const attr = searchElem.getAttribute("aria-label");
      if (attr !== null && regexPattern.test(attr.trim())) {
        const targetElemExpr = "li:has(div.isv)";
        const targetElem = searchElem.closest(targetElemExpr);
        if (targetElem !== null) {
          targetElem.remove();
        }
      }
    });
  } else {
    // 大文字小文字区別しないようにするための変数定義とtranslate関数の使用に必要。
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    // Xpath式
    const xpath =
      `//li[` +
      `div[contains(@class,'isv')]` +
      `//a[contains(` +
      `translate(@aria-label,'${uppercase}','${lowercase}'), '${word}'` +
      `)]` +
      `]`;
    // xpathを使って検索
    const xpath_result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    // xpathの結果を使って要素を削除
    for (let i = 0; i < xpath_result.snapshotLength; i++) {
      const node = xpath_result.snapshotItem(i);
      node.remove();
    }
  }
}

// 引数の文字列を含むニュース検索結果を削除する
function rmNG_news(word, isRegex, isTitle) {
  // 正規表現オプションが指定されている場合の処理。
  if (isRegex) {
    // 検索するタグを指定する。
    const searchElems = document.querySelectorAll("div");
    const searchElemsLst = Array.from(searchElems);
    // 正規表現パターンを作成する。
    const regexPattern = new RegExp(word, "i");
    // 各要素に対して正規表現で検索して処理。
    searchElemsLst.forEach((searchElem) => {
      const classNames = Array.from(searchElem.classList);
      const attr1 = searchElem.getAttribute("data-author");
      const attr2 = searchElem.getAttribute("data-title");
      const attr3 = searchElem.getAttribute("title");
      if (
        classNames.includes("news-card") &&
        ((attr1 !== null && regexPattern.test(attr1.trim())) ||
          (attr2 !== null && regexPattern.test(attr2.trim())))
      ) {
        searchElem.remove();
      } else if (
        !isTitle &&
        attr3 !== null &&
        regexPattern.test(attr3.trim())
      ) {
        const targetElemExpr = "div.news-card";
        const targetElem = searchElem.closest(targetElemExpr);
        if (targetElem !== null) {
          targetElem.remove();
        }
      }
    });
  } else {
    // 大文字小文字区別しないようにするための変数定義とtranslate関数の使用に必要。
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    // Xpathで要素を検索し削除
    const xpath1 =
      `//div[contains(@class,'news-card')][` +
      `contains(` +
      `translate(@data-author,'${uppercase}','${lowercase}'),'${word}'` +
      `)` +
      `or contains(` +
      `translate(@data-title,'${uppercase}','${lowercase}'),'${word}'` +
      `)` +
      `]`;
    let xpaths = xpath1;
    if (!isTitle) {
      const xpath_desc1 =
        `//div[contains(@class,'news-card')][` +
        `.//div[contains(` +
        `translate(@title,'${uppercase}','${lowercase}'),'${word}'` +
        `)]` +
        `]`;
      xpaths += `|${xpath_desc1}`;
    }
    // xpathを使って検索
    const xpaths_result = document.evaluate(
      xpaths,
      document,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    // xpathの結果を使って要素を削除
    for (let i = 0; i < xpaths_result.snapshotLength; i++) {
      const node = xpaths_result.snapshotItem(i);
      node.remove();
    }
  }
}

// 引数の文字列を含むショップ検索結果を削除する
function rmNG_shop(word, isRegex) {
  // 正規表現オプションが指定されている場合の処理。
  if (isRegex) {
    // 検索するタグを指定する。
    const searchElems = document.querySelectorAll("span");
    const searchElemsLst = Array.from(searchElems);
    // 正規表現パターンを作成する。
    const regexPattern = new RegExp(word, "i");
    // 各要素に対して正規表現で検索して処理。
    searchElemsLst.forEach((searchElem) => {
      // テキストノードに対して正規表現で検索する。
      for (let elem of searchElem.childNodes) {
        if (
          elem.nodeName === "#text" &&
          regexPattern.test(elem.nodeValue.trim())
        ) {
          const targetElemExpr = "li.br-item";
          const targetElem = searchElem.closest(targetElemExpr);
          if (targetElem !== null) {
            targetElem.remove();
          }
        }
      }
    });
  } else {
    // 大文字小文字区別しないようにするための変数定義とtranslate関数の使用に必要。
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    // Xpath式
    const contains_text =
      `contains(` +
      `translate(./text(),'${uppercase}','${lowercase}'),'${word}'` +
      `)` +
      ` or strong[` +
      `contains(` +
      `translate(./text(),'${uppercase}','${lowercase}'),'${word}'` +
      `)` +
      `]`;
    const xpath = `//li[@class='br-item'][.//span[${contains_text}]]`;
    // xpathを使って検索
    const xpath_result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    // xpathの結果を使って要素を削除
    for (let i = 0; i < xpath_result.snapshotLength; i++) {
      const node = xpath_result.snapshotItem(i);
      node.remove();
    }
  }
}
