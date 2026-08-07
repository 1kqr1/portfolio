// ============================================================
// app.js — メインアプリケーションロジック
// ============================================================

class PortfolioApp {
  constructor() {
    this.currentPage = "home";
    this.animations = new AnimationManager();
    this.isTransitioning = false;

    // 公開サイトは常に data.js を正とする。
    // 管理画面(admin.html)の「プレビュー」だけ ?preview=local でローカル下書きを表示。
    const useLocalDraft =
      new URLSearchParams(location.search).get("preview") === "local";
    this.data =
      useLocalDraft && typeof PortfolioStorage !== "undefined"
        ? PortfolioStorage.loadData()
        : typeof DATA !== "undefined"
        ? DATA
        : {};

    this.init();
  }

  init() {
    // 「視差効果を減らす」設定のユーザーには過剰なモーションを出さない
    this.reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // DOM準備完了後に実行
    this.setupNavigation();
    this.setupMobileMenu();
    this.setupScrollEffects();
    this.renderAllContent();

    // 初期ページを設定（ハッシュから）
    const initialPage = window.location.hash.replace("#", "") || "home";
    this.navigateTo(initialPage, false);

    // タイピングアニメーション（控えめ設定なら固定表示）
    const phrases = [
      "Creating Digital Experiences",
      "Web Developer",
      "Building the Future",
      "Problem Solver",
    ];
    if (this.reduceMotion) {
      const el = document.getElementById("typing-text");
      if (el) el.textContent = phrases[0];
    } else {
      this.animations.startTyping("typing-text", phrases);
    }
  }

  // ----- ナビゲーション -----
  setupNavigation() {
    // ハッシュ変更を監視
    window.addEventListener("hashchange", () => {
      const page = window.location.hash.replace("#", "") || "home";
      if (page !== this.currentPage) {
        this.navigateTo(page);
      }
    });

    // ナビリンクのクリック
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const page = link.getAttribute("data-page");
        if (page) {
          // モバイルメニューを閉じる
          this.closeMobileMenu();
        }
      });
    });

    // ページ内のリンクも対応（CTAボタンなど）
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        this.closeMobileMenu();
      });
    });
  }

  async navigateTo(page, animate = true) {
    if (this.isTransitioning) return;

    const targetEl = document.getElementById(`page-${page}`);
    if (!targetEl) return;

    this.isTransitioning = true;

    // ナビリンクのアクティブ状態更新
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("data-page") === page);
    });

    if (animate && this.currentPage !== page) {
      const currentEl = document.getElementById(`page-${this.currentPage}`);
      await this.animations.pageTransition(currentEl, targetEl);
    } else {
      // 初回表示（アニメーションなし）
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
      targetEl.classList.add("active");
    }

    this.currentPage = page;
    this.isTransitioning = false;

    // ページ固有の初期化
    this.onPageEnter(page);

    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  onPageEnter(page) {
    // スクロールリビールを再初期化
    setTimeout(() => {
      this.animations.initScrollReveal();
      if (!this.reduceMotion) this.animations.initTiltEffect();
    }, 100);
  }

  // ----- モバイルメニュー -----
  setupMobileMenu() {
    const toggle = document.getElementById("nav-toggle");
    const navLinks = document.getElementById("nav-links");

    if (!toggle || !navLinks) return;

    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      navLinks.classList.toggle("open");
      document.body.style.overflow = navLinks.classList.contains("open")
        ? "hidden"
        : "";
    });
  }

  closeMobileMenu() {
    const toggle = document.getElementById("nav-toggle");
    const navLinks = document.getElementById("nav-links");
    if (toggle && navLinks) {
      toggle.classList.remove("active");
      navLinks.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  // ----- スクロールエフェクト -----
  setupScrollEffects() {
    let lastScroll = 0;
    const navbar = document.getElementById("main-nav");

    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY;

      if (navbar) {
        navbar.classList.toggle("scrolled", currentScroll > 50);
      }

      lastScroll = currentScroll;
    });
  }

  // ----- コンテンツ描画 -----
  renderAllContent() {
    this.renderAbout();
    this.renderProjects();
    this.renderSkills();
    this.renderTimeline();
  }

  renderAbout() {
    const bioEl = document.getElementById("about-bio");
    const detailsEl = document.getElementById("about-details");
    const socialsEl = document.getElementById("about-socials");

    if (bioEl) {
      bioEl.textContent = this.data.profile.bio;
    }

    if (detailsEl) {
      detailsEl.innerHTML = `
        <div class="about-detail-item stagger-item">
          <div class="about-detail-icon">👤</div>
          <div>
            <div class="about-detail-label">Name</div>
            <div class="about-detail-value">${
              this.data.profile.realName || this.data.profile.name
            }</div>
          </div>
        </div>
        <div class="about-detail-item stagger-item">
          <div class="about-detail-icon">🎓</div>
          <div>
            <div class="about-detail-label">University</div>
            <div class="about-detail-value">${this.data.profile.affiliation || ""}</div>
          </div>
        </div>
        <div class="about-detail-item stagger-item">
          <div class="about-detail-icon">📍</div>
          <div>
            <div class="about-detail-label">Location</div>
            <div class="about-detail-value">${this.data.profile.location}</div>
          </div>
        </div>
      `;
    }

    if (socialsEl) {
      const activeSocials = (this.data.socials || []).filter((s) => s.url);
      socialsEl.style.display = activeSocials.length ? "" : "none";
      socialsEl.innerHTML = activeSocials
        .map(
          (social) => `
        <a href="${social.url}" target="_blank" rel="noopener noreferrer" class="social-link stagger-item">
          ${social.icon}
          <span>${social.name}</span>
        </a>
      `
        )
        .join("");
    }
  }

  renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    grid.innerHTML = this.data.projects
      .map((project) => {
        // サムネイル：手動画像(image)が最優先。無ければ liveUrl から自動プレビュー生成。
        // ログインが要るサイト(紡シフト等)は data.js で preview:false にして自動生成を止める。
        const manual = project.image || "";
        const auto =
          project.liveUrl && project.preview !== false
            ? `https://image.thum.io/get/width/1024/crop/640/${project.liveUrl}`
            : "";
        const src = manual || auto;
        const isContain = project.imageFit === "contain";
        const fitClass = isContain ? " project-thumb--contain" : "";
        const imageBoxClass = isContain
          ? " project-image--framed"
          : "";
        // 手動画像が読めなければ自動プレビューへ、それも無ければ💻プレースホルダ
        const onErr =
          manual && auto
            ? `if(this.src.indexOf('thum.io')<0){this.src='${auto}'}else{this.remove()}`
            : "this.remove()";
        return `
      <div class="project-card tilt-card stagger-item" id="${project.id}">
        <div class="project-image${imageBoxClass}">
          <div class="project-image-placeholder">💻</div>
          ${
            src
              ? `<img class="project-thumb${fitClass}" src="${src}" alt="${project.title} のプレビュー" loading="lazy" onerror="${onErr}" />`
              : ""
          }
          <div class="project-image-overlay"></div>
        </div>
        <div class="project-body">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-tags">
            ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
          </div>
          <div class="project-links">
            ${
              project.liveUrl
                ? `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Live
                  </a>`
                : ""
            }
            ${
              project.githubUrl
                ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    GitHub
                  </a>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
      })
      .join("");
  }

  renderSkills() {
    const grid = document.getElementById("skills-grid");
    if (!grid) return;

    grid.innerHTML = this.data.skills
      .map(
        (category) => `
      <div class="skill-category stagger-item">
        <div class="skill-category-header">
          <div class="skill-category-icon">${category.icon}</div>
          <h3 class="skill-category-name">${category.category}</h3>
        </div>
        <div class="skill-chips">
          ${category.items
            .map((item) => {
              const label = typeof item === "string" ? item : item.name;
              return `<span class="skill-chip">${label}</span>`;
            })
            .join("")}
        </div>
      </div>
    `
      )
      .join("");
  }

  renderTimeline() {
    const timeline = document.getElementById("timeline");
    if (!timeline) return;

    // 年で新しい順（降順）にソート。元データの並びに依存しない
    const sorted = [...this.data.experience].sort(
      (a, b) => parseInt(b.year) - parseInt(a.year)
    );

    timeline.innerHTML = sorted
      .map(
        (item) => `
      <div class="timeline-item stagger-item">
        <div class="timeline-dot"></div>
        <span class="timeline-year">${item.year}</span>
        <div class="timeline-content">
          <span class="timeline-type ${item.type}">${this.getTypeLabel(item.type)}</span>
          <h3 class="timeline-title">${item.title}</h3>
          <p class="timeline-description">${item.description}</p>
        </div>
      </div>
    `
      )
      .join("");
  }

  getTypeLabel(type) {
    const labels = {
      education: "Education",
      work: "Work",
      project: "Project",
    };
    return labels[type] || type;
  }

}

// ----- 起動 -----
document.addEventListener("DOMContentLoaded", () => {
  new PortfolioApp();
});
