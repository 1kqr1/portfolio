// ============================================================
// app.js — メインアプリケーションロジック
// ============================================================

class PortfolioApp {
  constructor() {
    this.currentPage = "home";
    this.animations = new AnimationManager();
    this.particles = null;
    this.isTransitioning = false;
    this.data = typeof PortfolioStorage !== "undefined" ? PortfolioStorage.loadData() : DATA;

    this.init();
  }

  init() {
    // DOM準備完了後に実行
    this.setupNavigation();
    this.setupMobileMenu();
    this.setupScrollEffects();
    this.renderAllContent();
    this.setupContactForm();

    // パーティクル背景
    this.particles = new ParticleSystem("particle-canvas");

    // 初期ページを設定（ハッシュから）
    const initialPage = window.location.hash.replace("#", "") || "home";
    this.navigateTo(initialPage, false);

    // タイピングアニメーション開始
    this.animations.startTyping("typing-text", [
      "Creating Digital Experiences",
      "Web Developer",
      "Building the Future",
      "Problem Solver",
    ]);
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
      this.animations.initTiltEffect();

      // スキルページではプログレスバーアニメーション
      if (page === "skills") {
        setTimeout(() => {
          this.animations.animateProgressBars();
        }, 400);
      }
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
          <div class="about-detail-icon">📍</div>
          <div>
            <div class="about-detail-label">Location</div>
            <div class="about-detail-value">${this.data.profile.location}</div>
          </div>
        </div>
        <div class="about-detail-item stagger-item">
          <div class="about-detail-icon">✉️</div>
          <div>
            <div class="about-detail-label">Email</div>
            <div class="about-detail-value">${this.data.profile.email}</div>
          </div>
        </div>
      `;
    }

    if (socialsEl) {
      socialsEl.innerHTML = this.data.socials
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
      .map(
        (project) => `
      <div class="project-card tilt-card stagger-item" id="${project.id}">
        <div class="project-image">
          ${
            project.image
              ? `<img src="${project.image}" alt="${project.title}" loading="lazy" />`
              : `<div class="project-image-placeholder">💻</div>`
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
    `
      )
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
        ${category.items
          .map(
            (item) => `
          <div class="skill-item">
            <div class="skill-info">
              <span class="skill-name">${item.name}</span>
              <span class="skill-level">${item.level}%</span>
            </div>
            <div class="skill-progress">
              <div class="skill-progress-fill" data-level="${item.level}"></div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("");
  }

  renderTimeline() {
    const timeline = document.getElementById("timeline");
    if (!timeline) return;

    // 年を逆順（新しい方から）にソート
    const sorted = [...this.data.experience].reverse();

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

  // ----- お問い合わせフォーム -----
  setupContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name").value;
      const email = document.getElementById("contact-email").value;
      const message = document.getElementById("contact-message").value;

      // ここでは送信のデモとしてメッセージを表示
      // 実際のバックエンド連携は後で設定可能
      const formContent = form.parentElement;
      const successMessage = document.createElement("div");
      successMessage.className = "form-success";
      successMessage.innerHTML = `
        <p>✨ メッセージを受け取りました！</p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.8;">
          ${name}さん、お問い合わせありがとうございます。
        </p>
      `;

      form.style.display = "none";
      formContent.appendChild(successMessage);

      // 5秒後にフォームをリセット
      setTimeout(() => {
        form.reset();
        form.style.display = "flex";
        successMessage.remove();
      }, 5000);
    });
  }
}

// ----- 起動 -----
document.addEventListener("DOMContentLoaded", () => {
  new PortfolioApp();
});
