/* ============================================================
   storage.js — localStorage でデータを永続化
   ------------------------------------------------------------
   ・localStorage にデータがあれば、それを返す
   ・なければ works.js の WORKS 定数をフォールバックとして使う
   ・管理画面 (admin.html) から呼ばれる保存・書き出し機能もここに
   ============================================================ */

const WorksStorage = (function () {
  "use strict";

  const STORAGE_KEY = "portfolio_works";
  const CATEGORIES_KEY = "portfolio_categories";

  // --- 読み込み ---
  function loadWorks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("localStorage 読み込みエラー:", e);
    }
    // フォールバック: works.js の定数を使う
    return typeof WORKS !== "undefined" ? [...WORKS] : [];
  }

  function loadCategories() {
    try {
      const stored = localStorage.getItem(CATEGORIES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("localStorage 読み込みエラー:", e);
    }
    return typeof CATEGORIES !== "undefined" ? [...CATEGORIES] : [];
  }

  // --- 保存 ---
  function saveWorks(works) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
      return true;
    } catch (e) {
      console.error("localStorage 保存エラー:", e);
      return false;
    }
  }

  function saveCategories(categories) {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      return true;
    } catch (e) {
      console.error("localStorage 保存エラー:", e);
      return false;
    }
  }

  // --- エクスポート (JSONダウンロード) ---
  function exportJSON() {
    const data = {
      works: loadWorks(),
      categories: loadCategories(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- インポート (JSONファイルから読み込み) ---
  function importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.works && Array.isArray(data.works)) {
        saveWorks(data.works);
      }
      if (data.categories && Array.isArray(data.categories)) {
        saveCategories(data.categories);
      }
      return { success: true, count: (data.works || []).length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // --- works.js 用コード生成 ---
  function generateWorksJS() {
    const works = loadWorks();
    const categories = loadCategories();

    let code = `const CATEGORIES = ${JSON.stringify(categories, null, 2)};\n\n`;
    code += `const WORKS = ${JSON.stringify(works, null, 2)};\n`;
    return code;
  }

  // --- データがlocalStorageに存在するか ---
  function hasStoredData() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  // --- localStorageをクリア (works.jsのデータに戻す) ---
  function resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
  }

  return {
    loadWorks,
    loadCategories,
    saveWorks,
    saveCategories,
    exportJSON,
    importJSON,
    generateWorksJS,
    hasStoredData,
    resetToDefault,
  };
})();
