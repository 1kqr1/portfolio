/* ============================================================
   admin.js — 管理画面のロジック
   ============================================================ */

(function () {
  "use strict";

  // パスワード（簡易保護。本格的なセキュリティが必要なら別途バックエンド要）
  const ADMIN_PASSWORD = "admin";

  let works = [];
  let editingIndex = -1; // -1 = 新規追加, 0以上 = 編集中のインデックス

  // ===== DOM参照 =====
  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("dashboard");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const passwordInput = document.getElementById("login-password");

  const worksList = document.getElementById("works-list");
  const workCount = document.getElementById("work-count");

  const modalOverlay = document.getElementById("modal-overlay");
  const modalTitle = document.getElementById("modal-title");
  const workForm = document.getElementById("work-form");

  const toastContainer = document.getElementById("toast-container");

  // フォーム要素
  const formFields = {
    title: document.getElementById("f-title"),
    category: document.getElementById("f-category"),
    description: document.getElementById("f-description"),
    year: document.getElementById("f-year"),
    emoji: document.getElementById("f-emoji"),
    accent: document.getElementById("f-accent"),
    image: document.getElementById("f-image"),
  };

  const tagsContainer = document.getElementById("f-tags-container");
  const tagsInput = document.getElementById("f-tags-input");
  const linksContainer = document.getElementById("f-links");

  // ===== 初期化 =====
  function init() {
    // セッションチェック
    if (sessionStorage.getItem("admin_auth") === "true") {
      showDashboard();
    }

    // イベント
    loginForm.addEventListener("submit", handleLogin);
    workForm.addEventListener("submit", handleSaveWork);
    document.getElementById("btn-add-work").addEventListener("click", openAddModal);
    document.getElementById("btn-export").addEventListener("click", handleExport);
    document.getElementById("btn-import").addEventListener("click", handleImport);
    document.getElementById("btn-export-js").addEventListener("click", handleExportJS);
    document.getElementById("btn-reset").addEventListener("click", handleReset);
    document.getElementById("btn-preview").addEventListener("click", () => {
      window.open("index.html", "_blank");
    });
    document.getElementById("btn-logout").addEventListener("click", handleLogout);

    // モーダル閉じる
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("btn-cancel").addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // タグ入力
    tagsInput.addEventListener("keydown", handleTagInput);
    tagsContainer.addEventListener("click", () => tagsInput.focus());

    // リンク追加ボタン
    document.getElementById("btn-add-link").addEventListener("click", addLinkEntry);
  }

  // ===== ログイン =====
  function handleLogin(e) {
    e.preventDefault();
    const pw = passwordInput.value;

    if (pw === ADMIN_PASSWORD) {
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
    loadData();
    renderWorksList();
  }

  // ===== データ管理 =====
  function loadData() {
    works = WorksStorage.loadWorks();
  }

  function saveData() {
    WorksStorage.saveWorks(works);
  }

  // ===== 作品リスト描画 =====
  function renderWorksList() {
    workCount.textContent = `${works.length} 件`;

    if (works.length === 0) {
      worksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📂</div>
          <p class="empty-state-text">まだ作品がありません</p>
          <button class="btn btn-primary" onclick="document.getElementById('btn-add-work').click()">
            ＋ 最初の作品を追加
          </button>
        </div>`;
      return;
    }

    worksList.innerHTML = works
      .map(
        (w, i) => `
      <div class="work-item" draggable="true" data-index="${i}">
        <span class="work-drag-handle" title="ドラッグで並び替え">⠿</span>
        <div class="work-emoji">${w.emoji || "🧩"}</div>
        <div class="work-info">
          <div class="work-title">${escapeHTML(w.title)}</div>
          <div class="work-meta">
            <span class="cat-badge">${w.category}</span>
            ${w.year ? `<span>${w.year}</span>` : ""}
            ${w.tags ? `<span>${w.tags.length} tags</span>` : ""}
          </div>
        </div>
        <div class="work-actions">
          <button class="btn btn-sm" onclick="AdminApp.editWork(${i})" title="編集">✏️ 編集</button>
          <button class="btn btn-sm btn-danger" onclick="AdminApp.deleteWork(${i})" title="削除">🗑</button>
        </div>
      </div>`
      )
      .join("");

    // ドラッグ&ドロップ
    setupDragAndDrop();
  }

  // ===== モーダル =====
  function openAddModal() {
    editingIndex = -1;
    modalTitle.textContent = "作品を追加";
    workForm.reset();
    formFields.accent.value = "#4f46e5";
    clearTags();
    resetLinks();
    modalOverlay.classList.add("open");
    formFields.title.focus();
  }

  function openEditModal(index) {
    editingIndex = index;
    const w = works[index];
    modalTitle.textContent = "作品を編集";

    formFields.title.value = w.title || "";
    formFields.category.value = w.category || "webapp";
    formFields.description.value = w.description || "";
    formFields.year.value = w.year || "";
    formFields.emoji.value = w.emoji || "";
    formFields.accent.value = w.accent || "#4f46e5";
    formFields.image.value = w.image || "";

    // タグ
    clearTags();
    (w.tags || []).forEach((t) => addTagChip(t));

    // リンク
    resetLinks();
    (w.links || []).forEach((l) => addLinkEntry(l.label, l.url));

    modalOverlay.classList.add("open");
    formFields.title.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    editingIndex = -1;
  }

  // ===== フォーム保存 =====
  function handleSaveWork(e) {
    e.preventDefault();

    const workData = {
      title: formFields.title.value.trim(),
      category: formFields.category.value,
      description: formFields.description.value.trim(),
      year: formFields.year.value.trim(),
      emoji: formFields.emoji.value.trim() || "🧩",
      accent: formFields.accent.value,
      image: formFields.image.value.trim(),
      tags: getCurrentTags(),
      links: getCurrentLinks(),
    };

    if (!workData.title) {
      showToast("作品名を入力してください", "error");
      return;
    }

    if (editingIndex >= 0) {
      works[editingIndex] = workData;
      showToast(`「${workData.title}」を更新しました`, "success");
    } else {
      works.unshift(workData);
      showToast(`「${workData.title}」を追加しました`, "success");
    }

    saveData();
    renderWorksList();
    closeModal();
  }

  // ===== 削除 =====
  function deleteWork(index) {
    const w = works[index];
    if (!confirm(`「${w.title}」を削除しますか？\nこの操作は取り消せません。`)) return;

    works.splice(index, 1);
    saveData();
    renderWorksList();
    showToast(`「${w.title}」を削除しました`, "info");
  }

  // ===== タグ入力 =====
  function handleTagInput(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tagsInput.value.trim().replace(",", "");
      if (value) {
        addTagChip(value);
        tagsInput.value = "";
      }
    }
    if (e.key === "Backspace" && tagsInput.value === "") {
      const chips = tagsContainer.querySelectorAll(".tag-chip");
      if (chips.length > 0) {
        chips[chips.length - 1].remove();
      }
    }
  }

  function addTagChip(text) {
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.innerHTML = `${escapeHTML(text)}<span class="tag-remove" onclick="this.parentElement.remove()">×</span>`;
    tagsContainer.insertBefore(chip, tagsInput);
  }

  function clearTags() {
    tagsContainer.querySelectorAll(".tag-chip").forEach((c) => c.remove());
  }

  function getCurrentTags() {
    return Array.from(tagsContainer.querySelectorAll(".tag-chip")).map((c) =>
      c.textContent.replace("×", "").trim()
    );
  }

  // ===== リンク入力 =====
  function addLinkEntry(label, url) {
    const entry = document.createElement("div");
    entry.className = "link-entry";
    entry.innerHTML = `
      <input type="text" class="form-input" placeholder="ラベル（例：デモ）" value="${escapeAttr(typeof label === "string" ? label : "")}" data-field="label" />
      <input type="text" class="form-input" placeholder="URL" value="${escapeAttr(typeof url === "string" ? url : "")}" data-field="url" />
      <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">×</button>
    `;
    linksContainer.appendChild(entry);
  }

  function resetLinks() {
    linksContainer.innerHTML = "";
  }

  function getCurrentLinks() {
    return Array.from(linksContainer.querySelectorAll(".link-entry"))
      .map((entry) => ({
        label: entry.querySelector('[data-field="label"]').value.trim(),
        url: entry.querySelector('[data-field="url"]').value.trim(),
      }))
      .filter((l) => l.label && l.url);
  }

  // ===== ドラッグ&ドロップ =====
  function setupDragAndDrop() {
    const items = worksList.querySelectorAll(".work-item");
    let dragSrc = null;

    items.forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        dragSrc = item;
        item.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.dataset.index);
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        items.forEach((el) => el.classList.remove("drag-over"));
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        item.classList.add("drag-over");
      });

      item.addEventListener("dragleave", () => {
        item.classList.remove("drag-over");
      });

      item.addEventListener("drop", (e) => {
        e.preventDefault();
        item.classList.remove("drag-over");
        const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
        const toIndex = parseInt(item.dataset.index);

        if (fromIndex !== toIndex) {
          const movedItem = works.splice(fromIndex, 1)[0];
          works.splice(toIndex, 0, movedItem);
          saveData();
          renderWorksList();
          showToast("並び順を変更しました", "info");
        }
      });
    });
  }

  // ===== エクスポート / インポート =====
  function handleExport() {
    WorksStorage.exportJSON();
    showToast("JSONファイルをダウンロードしました", "success");
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
        const result = WorksStorage.importJSON(ev.target.result);
        if (result.success) {
          loadData();
          renderWorksList();
          showToast(`${result.count} 件の作品をインポートしました`, "success");
        } else {
          showToast(`インポートエラー: ${result.error}`, "error");
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  function handleExportJS() {
    const code = WorksStorage.generateWorksJS();
    // コードをモーダルで表示
    const codeModal = document.getElementById("code-modal");
    document.getElementById("code-output").textContent = code;
    codeModal.classList.add("open");
  }

  function handleReset() {
    if (
      !confirm(
        "保存されたデータをすべてリセットして、works.js の初期データに戻しますか？\nこの操作は取り消せません。"
      )
    )
      return;

    WorksStorage.resetToDefault();
    loadData();
    renderWorksList();
    showToast("初期データにリセットしました", "info");
  }

  // ===== トースト通知 =====
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ===== ユーティリティ =====
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ===== グローバル公開（HTMLのonclickから使えるように）=====
  window.AdminApp = {
    editWork: openEditModal,
    deleteWork: deleteWork,
  };

  // 起動
  init();
})();
