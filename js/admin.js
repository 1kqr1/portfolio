/* ============================================================
   admin.js — 管理画面ロジック（GUI版）
   ============================================================ */

(function () {
  "use strict";

  // "admin" という文字列をSHA-256でハッシュ化した値
  // 変更したい場合はブラウザのコンソールで await crypto.subtle.digest("SHA-256", new TextEncoder().encode("新しいパスワード")).then(b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')) を実行して書き換えます
  const ADMIN_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";
  
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
    document.getElementById("btn-github-fetch").addEventListener("click", fetchGithubRepos);

    // タブ切り替え
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        e.target.classList.add("active");
        document.getElementById(e.target.dataset.tab).classList.add("active");
      });
    });

    // モーダルの背景クリックで閉じる
    document.querySelectorAll(".modal").forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });

    // プロフィール保存
    document.getElementById("form-profile").addEventListener("submit", (e) => {
      e.preventDefault();
      saveProfile();
    });

    // 日記画像アップロード
    const diaryImageFile = document.getElementById("diary-image-file");
    if (diaryImageFile) {
      diaryImageFile.addEventListener("change", handleDiaryImageUpload);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const password = passwordInput.value;
    
    // ブラウザの機能で入力されたパスワードをハッシュ化
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hashHex === ADMIN_HASH) {
      sessionStorage.setItem("admin_auth", "true");
      loginError.classList.remove("show");
      showDashboard();
    } else {
      loginError.textContent = "パスワードが違います";
      loginError.classList.add("show");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    dashboard.classList.remove("active");
    loginScreen.style.display = "flex";
    if (passwordInput) passwordInput.value = "";
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
    renderDiaryList();
  }

  // ===== プロフィール =====
  function renderProfile() {
    document.getElementById("prof-name").value = appData.profile.name || "";
    document.getElementById("prof-realname").value = appData.profile.realName || "";
    document.getElementById("prof-tagline").value = appData.profile.tagline || "";
    document.getElementById("prof-affiliation").value = appData.profile.affiliation || "";
    document.getElementById("prof-bio").value = appData.profile.bio || "";
    document.getElementById("prof-location").value = appData.profile.location || "";
    if (appData.settings) {
      document.getElementById("settings-site-url").value = appData.settings.siteUrl || "";
      document.getElementById("settings-ogp-image").value = appData.settings.ogpImage || "";
    }
  }

  function saveProfile() {
    appData.profile.name = document.getElementById("prof-name").value;
    appData.profile.realName = document.getElementById("prof-realname").value;
    appData.profile.tagline = document.getElementById("prof-tagline").value;
    appData.profile.affiliation = document.getElementById("prof-affiliation").value;
    appData.profile.bio = document.getElementById("prof-bio").value;
    appData.profile.location = document.getElementById("prof-location").value;
    
    if (!appData.settings) appData.settings = {};
    appData.settings.siteUrl = document.getElementById("settings-site-url").value;
    appData.settings.ogpImage = document.getElementById("settings-ogp-image").value;

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

  // ===== GitHub 候補リスト =====
  // 認証なしで叩くため、公開リポジトリのみが対象（非公開は自動的に取得できない＝除外される）
  let githubRepos = [];

  function openGithubModal() {
    document.getElementById("modal-github").classList.add("open");
    if (!githubRepos.length) {
      fetchGithubRepos();
    }
  }

  async function fetchGithubRepos() {
    const username = document.getElementById("github-username").value.trim();
    const listEl = document.getElementById("github-repo-list");
    if (!username) {
      showToast("GitHubユーザー名を入力してください", "error");
      return;
    }
    const btn = document.getElementById("btn-github-fetch");
    btn.disabled = true;
    btn.textContent = "取得中...";
    listEl.innerHTML = `<div class="empty-state">読み込み中...</div>`;
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`
      );
      if (!res.ok) {
        throw new Error(res.status === 404 ? "ユーザーが見つかりません" : `取得に失敗しました (${res.status})`);
      }
      const repos = await res.json();
      githubRepos = repos.filter((r) => !r.fork);
      renderGithubRepoList();
    } catch (e) {
      listEl.innerHTML = `<div class="empty-state">${escapeHtml(e.message)}</div>`;
      githubRepos = [];
    } finally {
      btn.disabled = false;
      btn.textContent = "取得";
    }
  }

  function renderGithubRepoList() {
    const listEl = document.getElementById("github-repo-list");
    if (!githubRepos.length) {
      listEl.innerHTML = `<div class="empty-state">公開リポジトリが見つかりませんでした</div>`;
      return;
    }
    listEl.innerHTML = githubRepos
      .map(
        (repo, i) => `
      <div class="list-item">
        <div class="item-info">
          <div class="item-title">${escapeHtml(repo.name)}</div>
          <div class="item-meta">
            ${repo.language ? `<span class="badge badge-accent">${escapeHtml(repo.language)}</span>` : ""}
            <span>${repo.description ? escapeHtml(repo.description) : "説明なし"}</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm" onclick="AdminApp.addProjectFromGithub(${i})">＋ 追加</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  function addProjectFromGithub(index) {
    const repo = githubRepos[index];
    if (!repo) return;
    openProjectModal(-1);
    const slug = "project-" + repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    document.getElementById("proj-id").value = slug;
    document.getElementById("proj-title").value = repo.name;
    document.getElementById("proj-description").value = repo.description || "";
    document.getElementById("proj-tags").value = repo.language || "";
    document.getElementById("proj-live").value = repo.homepage || "";
    document.getElementById("proj-github").value = repo.html_url || "";
    closeModal("modal-github");
    showToast("内容を確認して保存してください", "info");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
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
    const container = document.getElementById("skills-editor-list");
    if (!container) return;
    container.innerHTML = "";
    
    appData.skills.forEach((skill, index) => {
      const itemsStr = skill.items ? skill.items.join(", ") : "";
      container.innerHTML += `
        <div style="background: var(--bg-card-hover); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--line); position: relative;">
          <div style="display:flex; gap:12px; margin-bottom:12px;">
            <div style="flex:0 0 60px;">
              <label class="form-label">アイコン</label>
              <input type="text" class="form-input" value="${skill.icon || ''}" onchange="AdminApp.updateSkill(${index}, 'icon', this.value)" placeholder="絵文字など">
            </div>
            <div style="flex:1;">
              <label class="form-label">カテゴリ名</label>
              <input type="text" class="form-input" value="${skill.category || ''}" onchange="AdminApp.updateSkill(${index}, 'category', this.value)" placeholder="例: Frontend">
            </div>
            <div style="flex:0 0 auto; display:flex; align-items:flex-end;">
              <button class="btn btn-danger btn-sm" onclick="AdminApp.removeSkillCategory(${index})">削除</button>
            </div>
          </div>
          <div>
            <label class="form-label">スキル項目 (カンマ区切り)</label>
            <input type="text" class="form-input" value="${itemsStr}" onchange="AdminApp.updateSkill(${index}, 'items', this.value)" placeholder="HTML, CSS, JavaScript...">
          </div>
        </div>
      `;
    });
  }

  function addSkillCategory() {
    appData.skills.push({ category: "New Category", icon: "✨", items: [] });
    renderSkills();
  }

  function updateSkill(index, field, value) {
    if (field === 'items') {
      appData.skills[index][field] = value.split(',').map(s => s.trim()).filter(s => s !== "");
    } else {
      appData.skills[index][field] = value;
    }
  }

  function removeSkillCategory(index) {
    if (confirm("このカテゴリを削除しますか？")) {
      appData.skills.splice(index, 1);
      renderSkills();
    }
  }

  function saveSkills() {
    saveData();
    showToast("スキル情報を保存しました", "success");
  }

  // ===== 日記 (Diary) =====
  function renderDiaryList() {
    const list = document.getElementById("list-diary");
    if (!list) return;
    list.innerHTML = "";
    if (!appData.diary || !appData.diary.length) {
      list.innerHTML = `<div class="empty-state">まだ日記がありません。「＋ 新規追加」から投稿してください。</div>`;
      return;
    }
    appData.diary.forEach((d, index) => {
      list.innerHTML += `
        <div class="list-item">
          <div class="item-info">
            <div class="item-title">${d.title}</div>
            <div class="item-meta">
              <span>Date: ${d.date}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-sm" onclick="AdminApp.editDiary(${index})">編集</button>
            <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteDiary(${index})">削除</button>
          </div>
        </div>
      `;
    });
  }

  function openDiaryModal(index = -1) {
    const modal = document.getElementById("modal-diary");
    if (!modal) return;
    document.getElementById("diary-modal-title").innerText = index === -1 ? "日記を追加" : "日記を編集";
    document.getElementById("diary-index").value = index;
    
    if (index === -1) {
      document.getElementById("form-diary").reset();
      // 今日の日付をセット
      const today = new Date().toISOString().split('T')[0];
      document.getElementById("diary-date").value = today;
    } else {
      const d = appData.diary[index];
      document.getElementById("diary-title").value = d.title || "";
      document.getElementById("diary-date").value = d.date || "";
      document.getElementById("diary-image").value = d.image || "";
      document.getElementById("diary-content").value = d.content || "";
    }
    modal.classList.add("open");
  }

  function handleDiaryImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        document.getElementById("diary-image").value = dataUrl;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function saveDiary() {
    if (!appData.diary) appData.diary = [];
    const index = parseInt(document.getElementById("diary-index").value);
    
    // バリデーション
    const title = document.getElementById("diary-title").value.trim();
    const date = document.getElementById("diary-date").value;
    const image = document.getElementById("diary-image").value.trim();
    const content = document.getElementById("diary-content").value.trim();
    if (!title || !date || !content) {
      showToast("すべての項目を入力してください", "error");
      return;
    }

    const entry = {
      id: index === -1 ? `diary-${Date.now()}` : appData.diary[index].id,
      title: title,
      date: date,
      image: image,
      content: content
    };

    if (index === -1) {
      // 先頭に追加（最新が上）
      appData.diary.unshift(entry);
    } else {
      appData.diary[index] = entry;
    }
    
    // 日付順でソート（新しい順）
    appData.diary.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveData();
    renderDiaryList();
    closeModal("modal-diary");
    showToast("日記を保存しました", "success");
  }

  function deleteDiary(index) {
    if (confirm(`「${appData.diary[index].title}」を削除しますか？`)) {
      appData.diary.splice(index, 1);
      saveData();
      renderDiaryList();
      showToast("削除しました", "info");
    }
  }

  // ===== ユーティリティ =====
  function saveData() {
    localStorage.setItem("portfolio_backup", JSON.stringify(appData));
    document.getElementById("btn-undo").style.display = "block";
    PortfolioStorage.saveData(appData);
  }

  function undo() {
    const backup = localStorage.getItem("portfolio_backup");
    if (backup) {
      appData = JSON.parse(backup);
      PortfolioStorage.saveData(appData);
      renderAll();
      showToast("一つ前の状態に復元しました", "success");
      document.getElementById("btn-undo").style.display = "none";
      localStorage.removeItem("portfolio_backup");
    } else {
      showToast("復元できるデータがありません", "error");
    }
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (!confirm("現在のデータはすべて上書きされます。インポートを続行しますか？")) {
        return;
      }
      
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
    saveSkills, addSkillCategory, updateSkill, removeSkillCategory, closeModal,
    openDiaryModal, editDiary: openDiaryModal, deleteDiary, saveDiary,
    handleImport, undo,
  };

  init();
})();
