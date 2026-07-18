/* ============================================================
   storage.js — localStorage でデータを永続化（ネオンポートフォリオ用）
   ============================================================ */

const PortfolioStorage = (function () {
  "use strict";

  const STORAGE_KEY = "neon_portfolio_data";

  // --- 読み込み ---
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("localStorage 読み込みエラー:", e);
    }
    // フォールバック: data.js の DATA 定数を使う
    return typeof DATA !== "undefined" ? JSON.parse(JSON.stringify(DATA)) : null;
  }

  // --- 保存 ---
  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("localStorage 保存エラー:", e);
      return false;
    }
  }

  // --- エクスポート (JSONダウンロード) ---
  function exportJSON() {
    const data = loadData();
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
      if (data && data.profile && data.projects) {
        saveData(data);
        return { success: true };
      }
      return { success: false, error: "無効なデータフォーマットです" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // --- data.js 用コード生成 ---
  function generateDataJS() {
    const data = loadData();
    return `const DATA = ${JSON.stringify(data, null, 2)};\n`;
  }

  function resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    loadData,
    saveData,
    exportJSON,
    importJSON,
    generateDataJS,
    resetToDefault,
  };
})();
