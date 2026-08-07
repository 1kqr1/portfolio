/* ============================================================
   admin.js — 管理画面ロジック（GUI版）
   ============================================================ */

(function () {
  "use strict";

  const ADMIN_PASSWORD = "admin";
  let appData = null;

  // ===== DOM =====
  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("dashboard");
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("login-password");
  const loginError = document.getElementById("login-error");
  const toastContainer = document.getElementById("toast-container");

  // ===== 初期化 =====
  function init() {
    if (sessionStorage.getItem("admin_auth") === "true") {
      showDashboard();
    }
    
    // イベントリスナー
    loginForm.addEventListener("submit", handleLogin);
    document.getElementById("btn-logout").addEventListener("click", handleLogout);
    document.getElementById("btn-export").addEventListener("click", () => PortfolioStorage.exportJSON());
    document.getElementById("btn-import").addEventListener("click", handleImport);
    document.getElementById("btn-reset").addEventListener("click", handleReset);
    document.getElementById("btn-export-js").addEventListener("click", handleExportJS);
    document.getElementById("btn-preview").addEventListener("click", () => window.open("index.html?preview=local", "_blank"));
    
    // タブ切り替え
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        e.target.classList.add("active");
        document.getElementById(e.target.dataset.tab).classList.add("active");
      });
    });

    // プロフィール保存
    document.getElementById("form-profile").addEventListener("submit", (e) => {
      e.preventDefault();
      saveProfile();
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
    appData = PortfolioStorage.loadData();
    renderAll();
  }

  function renderAll() {
    renderProfile();
    renderProjects();
    renderExperience();
    renderSkills();
  }

  // ===== プロフィール =====
  function renderProfile() {
    document.getElementById("prof-name").value = appData.profile.name || "";
    document.getElementById("prof-realname").value = appData.profile.realName || "";
    document.getElementById("prof-tagline").value = appData.profile.tagline || "";
    document.getElementById("prof-affiliation").value = appData.profile.affiliation || "";
    document.getElementById("prof-bio").value = appData.profile.bio || "";
    document.getElementById("prof-location").value = appData.profile.location || "";
  }

  function saveProfile() {
    appData.profile.name = document.getElementById("prof-name").value;
    appData.profile.realName = document.getElementById("prof-realname").value;
    appData.profile.tagline = document.getElementById("prof-tagline").value;
    appData.profile.affiliation = document.getElementById("prof-affiliation").value;
    appData.profile.bio = document.getElementById("prof-bio").value;
    appData.profile.location = document.getElementById("prof-location").value;
    saveData();
    showToast("プロフィールを保存しました", "success");
  }

  // ===== 作品 (Projects) =====
  function renderProjects() {
    const list = document.getElementById("list-projects");
    list.innerHTML = "";
    if (!appData.projects.length) {
      list.innerHTML = `<div class="empty-state">まだ作品がありません。「＋ 作品を追加」から登録してください。</div>`;
      return;
    }
    appData.projects.forEach((proj, index) => {
      list.innerHTML += `
        <div class="list-item">
          <div class="item-info">
            <div class="item-title">${proj.title}</div>
            <div class="item-meta">
              <span>ID: ${proj.id}</span>
              <span>Tags: ${(proj.tags || []).join(", ")}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-sm" onclick="AdminApp.editProject(${index})">編集</button>
            <button class="btn btn-sm btn-danger" onclick="AdminApp.deleteProject(${index})">削除</button>
          </div>
        </div>
      `;
    });
  }

  function openProjectModal(index = -1) {
    const modal = document.getElementById("modal-project");
    document.getElementById("project-modal-title").innerText = index === -1 ? "作品の追加" : "作品の編集";
    document.getElementById("proj-index").value = index;
    
    if (index === -1) {
      document.getElementById("form-project").reset();
    } else {
      const proj = appData.projects[index];
      document.getElementById("proj-id").value = proj.id || "";
      document.getElementById("proj-title").value = proj.title || "";
      document.getElementById("proj-description").value = proj.description || "";
      document.getElementById("proj-tags").value = (proj.tags || []).join(", ");
      document.getElementById("proj-live").value = proj.liveUrl || "";
      document.getElementById("proj-github").value = proj.githubUrl || "";
      document.getElementById("proj-image").value = proj.image || "";
      document.getElementById("proj-fit-contain").checked = proj.imageFit === "contain";
      document.getElementById("proj-no-autopreview").checked = proj.preview === false;
    }
    modal.classList.add("open");
  }

  function saveProject() {
    const index = parseInt(document.getElementById("proj-index").value);
    const imagePath = document.getElementById("proj-image").value.trim();
    const proj = {
      id: document.getElementById("proj-id").value,
      title: document.getElementById("proj-title").value,
      description: document.getElementById("proj-description").value,
      tags: document.getElementById("proj-tags").value.split(",").map(t => t.trim()).filter(t => t),
      liveUrl: document.getElementById("proj-live").value,
      githubUrl: document.getElementById("proj-github").value,
      image: imagePath || null,
      imageFit: document.getElementById("proj-fit-contain").checked ? "contain" : undefined,
      preview: document.getElementById("proj-no-autopreview").checked ? false : undefined,
    };

    if (index === -1) {
      appData.projects.unshift(proj);
    } else {
      appData.projects[index] = proj;
    }
    saveData();
    renderProjects();
    closeModal("modal-project");
    showToast("作品を保存しました", "success");
  }

  function deleteProject(index) {
    if (confirm(`「${appData.projects[index].title}」を削除しますか？`)) {
      appData.projects.splice(index, 1);
      saveData();
      renderProjects();
      showToast("削除しました", "info");
    }
  }

  // ===== 経歴 (Experience) =====
  function renderExperience() {
    const list = document.getElementById("list-experience");
    list.innerHTML = "";
    if (!appData.experience.length) {
      list.innerHTML = `<div class="empty-state">まだ経歴がありません。「＋ 経歴を追加」から登録してください。</div>`;
      return;
    }
    appData.experience.forEach((exp, index) => {
      list.innerHTML += `
        <div class="list-item">
          <div class="item-info">
            <div class="item-title">${exp.year} : ${exp.title}</div>
            <div class="item-meta">
              <span class="badge badge-accent">${exp.type}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-sm" onclick="AdminApp.editExperience(${index})">編集</button>
            <button class="btn btn-sm btn-danger" onclick="AdminApp.deleteExperience(${index})">削除</button>
          </div>
        </div>
      `;
    });
  }

  function openExperienceModal(index = -1) {
    const modal = document.getElementById("modal-experience");
    document.getElementById("exp-modal-title").innerText = index === -1 ? "経歴の追加" : "経歴の編集";
    document.getElementById("exp-index").value = index;
    
    if (index === -1) {
      document.getElementById("form-experience").reset();
    } else {
      const exp = appData.experience[index];
      document.getElementById("exp-year").value = exp.year || "";
      document.getElementById("exp-title").value = exp.title || "";
      document.getElementById("exp-description").value = exp.description || "";
      document.getElementById("exp-type").value = exp.type || "education";
    }
    modal.classList.add("open");
  }

  function saveExperience() {
    const index = parseInt(document.getElementById("exp-index").value);
    const exp = {
      year: document.getElementById("exp-year").value,
      title: document.getElementById("exp-title").value,
      description: document.getElementById("exp-description").value,
      type: document.getElementById("exp-type").value
    };

    if (index === -1) {
      appData.experience.push(exp);
      // 年でソート(降順)
      appData.experience.sort((a,b) => parseInt(b.year) - parseInt(a.year));
    } else {
      appData.experience[index] = exp;
    }
    saveData();
    renderExperience();
    closeModal("modal-experience");
    showToast("経歴を保存しました", "success");
  }

  function deleteExperience(index) {
    if (confirm(`経歴「${appData.experience[index].title}」を削除しますか？`)) {
      appData.experience.splice(index, 1);
      saveData();
      renderExperience();
      showToast("削除しました", "info");
    }
  }

  // ===== スキル (Skills) =====
  function renderSkills() {
    document.getElementById("skills-json").value = JSON.stringify(appData.skills, null, 2);
  }

  function saveSkills() {
    try {
      appData.skills = JSON.parse(document.getElementById("skills-json").value);
      saveData();
      showToast("スキル情報を保存しました", "success");
    } catch (e) {
      showToast("JSON形式が不正です", "error");
    }
  }

  // ===== ユーティリティ =====
  function saveData() {
    PortfolioStorage.saveData(appData);
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
          appData = PortfolioStorage.loadData();
          renderAll();
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
      appData = PortfolioStorage.loadData();
      renderAll();
      showToast("初期化しました", "info");
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

  function closeModal(id) {
    document.getElementById(id).classList.remove("open");
  }

  // グローバル公開
  window.AdminApp = {
    openProjectModal, editProject: openProjectModal, deleteProject, saveProject,
    openExperienceModal, editExperience: openExperienceModal, deleteExperience, saveExperience,
    saveSkills, closeModal
  };

  init();
})();
