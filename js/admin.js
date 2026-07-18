/* ============================================================
   admin.js — 管理画面ロジック（ネオン版）
   ============================================================ */

(function () {
  "use strict";

  const ADMIN_PASSWORD = "admin";

  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("dashboard");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const passwordInput = document.getElementById("login-password");
  
  const jsonEditor = document.getElementById("json-editor");
  const btnSave = document.getElementById("btn-save");
  const toastContainer = document.getElementById("toast-container");

  function init() {
    if (sessionStorage.getItem("admin_auth") === "true") {
      showDashboard();
    }

    loginForm.addEventListener("submit", handleLogin);
    btnSave.addEventListener("click", handleSave);
    
    document.getElementById("btn-logout").addEventListener("click", handleLogout);
    document.getElementById("btn-export").addEventListener("click", handleExport);
    document.getElementById("btn-import").addEventListener("click", handleImport);
    document.getElementById("btn-reset").addEventListener("click", handleReset);
    document.getElementById("btn-export-js").addEventListener("click", handleExportJS);
    document.getElementById("btn-preview").addEventListener("click", () => {
      window.open("index.html", "_blank");
    });
  }

  function handleLogin(e) {
    e.preventDefault();
    if (passwordInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      loginError.classList.remove("show");
      showDashboard();
    } else {
      loginError.classList.add("show");
      passwordInput.value = "";
      passwordInput.focus();
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    dashboard.classList.remove("active");
    loginScreen.style.display = "flex";
    passwordInput.value = "";
  }

  function showDashboard() {
    loginScreen.style.display = "none";
    dashboard.classList.add("active");
    loadDataToEditor();
  }

  function loadDataToEditor() {
    const data = PortfolioStorage.loadData();
    jsonEditor.value = JSON.stringify(data, null, 2);
  }

  function handleSave() {
    try {
      const data = JSON.parse(jsonEditor.value);
      if (PortfolioStorage.saveData(data)) {
        showToast("データを保存しました", "success");
      } else {
        showToast("保存に失敗しました", "error");
      }
    } catch (e) {
      showToast("JSONの形式が正しくありません: " + e.message, "error");
    }
  }

  function handleExport() {
    PortfolioStorage.exportJSON();
    showToast("ダウンロードしました", "success");
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = PortfolioStorage.importJSON(ev.target.result);
        if (result.success) {
          loadDataToEditor();
          showToast("インポートしました", "success");
        } else {
          showToast("エラー: " + result.error, "error");
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  function handleExportJS() {
    const code = PortfolioStorage.generateDataJS();
    const modal = document.getElementById("code-modal");
    document.getElementById("code-output").textContent = code;
    modal.classList.add("open");
  }

  function handleReset() {
    if (confirm("初期データにリセットしますか？この操作は取り消せません。")) {
      PortfolioStorage.resetToDefault();
      loadDataToEditor();
      showToast("初期データにリセットしました", "info");
    }
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.closeModal = function(id) {
    document.getElementById(id).classList.remove("open");
  }

  init();
})();
