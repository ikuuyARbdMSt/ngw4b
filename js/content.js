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
  // 選択テキストから余分な空白を削除
  selectionText = selectionText.replace(/^(\s|　)+|(\s|　)+$/g, "");
  selectionText = selectionText.replace(/\n(\s|　)+|(\s|　)+\n/g, "\n");

  // ポップアップウィンドウ用のオーバーレイを追加する
  const overlay = document.createElement("div");
  overlay.id = "ngw4b_overlay";
  document.body.appendChild(overlay);

  // ポップアップウィンドウを作成する
  const popup = document.createElement("div");
  popup.id = "ngw4b_popup";

  // ポップアップウィンドウにタイトルを追加する
  const popupTitle = document.createElement("h2");
  popupTitle.textContent = chrome.i18n.getMessage("Name");
  popup.appendChild(popupTitle);

  // ポップアップウィンドウにメッセージを追加する
  const popupMessage = document.createElement("p");
  popupMessage.id = "ngw4b_popupMessage";
  popupMessage.textContent = chrome.i18n.getMessage(
    "ContextMenu_PopupWindow_Message"
  );
  popup.appendChild(popupMessage);

  // ポップアップウィンドウにテキストエリアを追加する
  const popupInput = document.createElement("input");
  popupInput.type = "text";
  popupInput.id = "ngw4b_popupInput";
  popupInput.value = selectionText;
  popup.appendChild(popupInput);

  // ポップアップウィンドウ用のオプションチェックボックスのコンテナを作成
  const popupCheckboxes = document.createElement("div");
  popupCheckboxes.id = "ngw4b_popupCheckboxes";

  // タイトル限定オプションのチェックボックスを作成する
  const checkboxLimitTitle = document.createElement("input");
  checkboxLimitTitle.type = "checkbox";
  checkboxLimitTitle.id = "ngw4b_checkboxLimitTitle";
  popupCheckboxes.appendChild(checkboxLimitTitle);

  // タイトル限定オプションのチェックボックス用ラベルを作成する
  const checkboxLimitTitle_label = document.createElement("label");
  checkboxLimitTitle_label.htmlFor = "ngw4b_checkboxLimitTitle";
  checkboxLimitTitle_label.textContent = chrome.i18n.getMessage(
    "ContextMenu_PopupWindow_CheckboxLimitTitle"
  );
  popupCheckboxes.appendChild(checkboxLimitTitle_label);

  // 正規表現オプションのチェックボックスを作成する
  const checkboxRegex = document.createElement("input");
  checkboxRegex.type = "checkbox";
  checkboxRegex.id = "ngw4b_checkboxRegex";
  popupCheckboxes.appendChild(checkboxRegex);

  // 正規表現オプションのチェックボックス用のラベルを作成する
  const checkboxRegex_label = document.createElement("label");
  checkboxRegex_label.htmlFor = "ngw4b_checkboxRegex";
  checkboxRegex_label.textContent = chrome.i18n.getMessage(
    "ContextMenu_PopupWindow_CheckboxRegex"
  );
  popupCheckboxes.appendChild(checkboxRegex_label);

  // ポップアップウィンドウに作成したオプションチェックボックスを追加する
  popup.appendChild(popupCheckboxes);

  // ポップアップウィンドウ用の選択ボタンコンテナを作成する
  const popupButtons = document.createElement("div");
  popupButtons.id = "ngw4b_popupButtons";

  // Yesボタンを作成する
  const yes_btn = document.createElement("button");
  yes_btn.textContent = chrome.i18n.getMessage("ContextMenu_PopupWindow_Yes");
  yes_btn.id = "ngw4b_popupButtons_yes-btn";
  popupButtons.appendChild(yes_btn);

  // Noボタンを作成する
  const no_btn = document.createElement("button");
  no_btn.textContent = chrome.i18n.getMessage("ContextMenu_PopupWindow_No");
  no_btn.id = "ngw4b_popupButtons_no-btn";
  popupButtons.appendChild(no_btn);

  // ポップアップウィンドウに作成した選択ボタンを追加する
  popup.appendChild(popupButtons);

  // ポップアップウィンドウを追加する
  document.body.appendChild(popup);

  // スタイルを追加する
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
    
    /* ポップアップメッセージ */
    #ngw4b_popupMessage {
        margin: 10px 0 10px;
    }

    /* ポップアップテキストエリア */
    #ngw4b_popupInput {
        margin: 10px 0 10px;
        width: calc(100% - 20px);
        border: 1px solid #ccc;
        padding: 8px;
    }
    
    /* ポップアップのチェックボックスコンテナ */
    #ngw4b_popupCheckboxes {
        margin: 10px 0 10px;
        display: flex;
        justify-content: center;
    }
    
    /* ポップアップのボタンコンテナ */
    #ngw4b_popupButtons {
        margin: 40px 0 40px;
    }

    /* NOボタン */
    #ngw4b_popupButtons_no-btn {
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
    #ngw4b_popupButtons_no-btn:hover {
        background-color: rgb(156, 7, 39);
    }

    /* OKボタン */
    #ngw4b_popupButtons_yes-btn {
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
    #ngw4b_popupButtons_yes-btn:hover {
        background-color: #0056b3;
    }
  `;
  document.body.appendChild(style);

  // テキストエリアの内容が変更されたら自動保存するようにする
  popupInput.addEventListener("input", function () {
    // テキストエリアからデータを取得
    let popupInputValue = popupInput.value ?? "";
    // データから先頭と末尾の空白を削除
    popupInputValue = popupInputValue.replace(/^(\s|　)+|(\s|　)+$/g, "");
    popupInputValue = popupInputValue.replace(/\n(\s|　)+|(\s|　)+\n/g, "\n");
    // ストレージに保存
    chrome.storage.sync.set({ ngw4b_popupInputValue: popupInputValue });
  });

  // チェックボックスの状態が変更されたときの処理(title)
  checkboxLimitTitle.addEventListener("change", function () {
    const opt = "title"; // オプション文字列を定義する
    let txt = popupInput.value ?? "";
    if (this.checked) {
      // チェックボックスがオンの場合
      txt = addOpt(txt, opt);
    } else {
      // チェックボックスがオフの場合
      txt = rmOpt(txt, opt);
    }
    popupInput.value = txt;
    chrome.storage.sync.set({ ngw4b_popupInputValue: txt });
  });

  // チェックボックスの状態が変更されたときの処理(regex)
  checkboxRegex.addEventListener("change", function () {
    const opt = "regex"; // オプション文字列を定義する
    let txt = popupInput.value ?? "";
    if (this.checked) {
      // チェックボックスがオンの場合
      txt = addOpt(txt, opt);
    } else {
      // チェックボックスがオフの場合
      txt = rmOpt(txt, opt);
    }
    popupInput.value = txt;
    chrome.storage.sync.set({ ngw4b_popupInputValue: txt });
  });

  // オプションを追加
  function addOpt(txt, opt) {
    const optMatch = txt.match(/\[[a-z,]*\]$/);
    if (optMatch !== null) {
      // オプション文字列から不要な[]を取り除き、コンマで分割する
      const opts = optMatch[0].replace(/^\[|\]$/g, "").split(",");
      if (!opts.includes(opt)) {
        if (opts[0] !== "" || opts.length > 1) {
          opt = "," + opt;
        }
        txt = txt.replace(/\]$/, `${opt}]`);
      }
    } else {
      txt += `[${opt}]`;
    }
    return txt;
  }

  // オプションを削除
  function rmOpt(txt, opt) {
    const optRegexPtrn = new RegExp(`${opt}([a-z,]*\])$`);
    txt = txt.replace(optRegexPtrn, "$1");
    txt = txt.replace(/,{2,}/, ",");
    txt = txt.replace(/\[,([a-z,]*\])$/, "[$1");
    txt = txt.replace(/,\]$/, "]");
    txt = txt.replace(/\[\]$/, "");
    console.log(txt);
    return txt;
  }

  // Yesボタンクリック時の処理
  yes_btn.addEventListener("click", () => {
    // 現在のNGリストを取得
    chrome.storage.sync.get("ngw4b_nglist", function (items) {
      let nglist = "";
      if (items.ngw4b_nglist !== undefined && items.ngw4b_nglist !== "") {
        nglist = items.ngw4b_nglist + "\n";
      }
      // ポップアップウィンドウで入力された値を取得する
      chrome.storage.sync.get("ngw4b_popupInputValue", function (items) {
        let ngText = selectionText;
        if (
          items.ngw4b_popupInputValue !== undefined &&
          items.ngw4b_popupInputValue !== ""
        ) {
          ngText = items.ngw4b_popupInputValue;
        }

        // NGリストにポップアップウィンドウで入力された値を追加する
        nglist += ngText;

        // NGリストから重複を削除
        nglist = [...new Set(nglist.split("\n"))].join("\n");

        // NGリストを保存
        chrome.storage.sync.set({ ngw4b_nglist: nglist });

        // 削除処理の実行
        exe_rmNG(ngText);
        chrome.storage.sync.set({ ngw4b_popupInputValue: "" });
      });
    });

    // ポップアップウィンドウを閉じる
    closePopup();
  });

  // Noボタンがクリックされたら、ポップアップウィンドウを閉じる処理のみ行う
  no_btn.addEventListener("click", closePopup);

  // ポップアップウィンドウを閉じる関数
  function closePopup() {
    document.getElementById("ngw4b_overlay").remove();
    document.getElementById("ngw4b_popup").remove();
    document.getElementById("ngw4b_style").remove();
  }
}

// 削除処理の実行
function exe_rmNG(word) {
  console.log("ngw4b called with word:", word);
  // ステータスを取得
  chrome.storage.sync.get("ngw4b_status", function (items) {
    let status = items.ngw4b_status;
    if (status === undefined) {
      status = true;
      chrome.storage.sync.set({ ngw4b_status: status });
    }

    // ステータスが有効モードの場合のみ削除処理を行う
    if (status) {
      // 検索ワードからオプションを抽出する
      const optMatch = word.match(/\[[a-z,]*\]$/);

      // 検索ワードにオプションが含まれている場合、そのオプションを処理する
      let isRegex = false;
      let isTitle = false;
      if (optMatch !== null) {
        // オプション文字列から不要な[]を取り除き、コンマで分割する
        const opts = optMatch[0].replace(/^\[|\]$/g, "").split(",");

        // オプション配列から不要な空白を除去する
        for (let i = 0; i < opts.length; i++) {
          opts[i] = opts[i].trim();
        }

        // regexが指定されている場合、正規表現として検索を行う
        if (opts.includes("regex")) {
          isRegex = true;
        }

        // titleが指定されている場合、タイトルのみを検索対象とする
        if (opts.includes("title")) {
          isTitle = true;
        }

        // オプションを削除して、検索ワードのみにする
        word = word.replace(optPattern, "");
      }

      // 開いているページを取得
      const currentURL = window.location.href;

      // 削除処理
      const pattern_img = /^https:\/\/www\.bing\.com\/images\//;
      const pattern_news = /^https:\/\/www\.bing\.com\/news\//;
      const pattern_shop = /^https:\/\/www\.bing\.com\/shop\?/;
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
  // 正規表現オプションが指定されている場合の処理
  if (isRegex) {
    // 検索するタグを指定する
    const searchElems = document.querySelectorAll("p, a, div, span");
    const searchElemsLst = Array.from(searchElems);
    // 正規表現パターンを作成する
    const regexPattern = new RegExp(word, "i");
    // 各要素に対して正規表現で検索して処理
    searchElemsLst.forEach((searchElem) => {
      const tagName = searchElem.nodeName;
      const classNames = Array.from(searchElem.classList);
      let targetElemExpr = "";
      let isDeleted = false;
      // テキストノードを検索し、削除する要素を指定する
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

      // aタグのaria-label属性を検索し、削除する要素を指定する
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

      // 指定された要素を削除する
      if (targetElemExpr) {
        const targetElem = searchElem.closest(targetElemExpr);
        if (targetElem !== null) {
          targetElem.remove();
          isDeleted = true;
        }
      }

      // 正規表現でマッチした属性値を持つdiv要素を削除する（data-displaynameまたはdata-title属性）
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
    // 検索テキストを小文字に変換
    word = word.toLowerCase();

    // 大文字小文字区別しないようにするための変数定義とtranslate関数の使用に必要
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
  // 正規表現オプションが指定されている場合の処理
  if (isRegex) {
    // 検索するタグを指定する
    const searchElems = document.querySelectorAll("a");
    const searchElemsLst = Array.from(searchElems);

    // 正規表現パターンを作成する
    const regexPattern = new RegExp(word, "i");

    // 各要素に対して正規表現で検索して処理
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
    // 検索テキストを小文字に変換
    word = word.toLowerCase();

    // 大文字小文字区別しないようにするための変数定義とtranslate関数の使用に必要
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
  // 正規表現オプションが指定されている場合の処理
  if (isRegex) {
    // 検索するタグを指定する
    const searchElems = document.querySelectorAll("div");
    const searchElemsLst = Array.from(searchElems);

    // 正規表現パターンを作成する
    const regexPattern = new RegExp(word, "i");

    // 各要素に対して正規表現で検索して処理
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
    // 検索テキストを小文字に変換
    word = word.toLowerCase();

    // 大文字小文字区別しないようにするための変数定義とtranslate関数の使用に必要
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";

    // Xpath式
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
  // 正規表現オプションが指定されている場合の処理
  if (isRegex) {
    // 検索するタグを指定する
    const searchElems = document.querySelectorAll("span");
    const searchElemsLst = Array.from(searchElems);

    // 正規表現パターンを作成する
    const regexPattern = new RegExp(word, "i");

    // 各要素に対して正規表現で検索して処理
    searchElemsLst.forEach((searchElem) => {
      // テキストノードに対しての検索処理
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
    // 検索テキストを小文字に変換
    word = word.toLowerCase();

    // 大文字小文字区別しないようにするための変数定義とtranslate関数の使用に必要
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
