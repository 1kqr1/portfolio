// ============================================================
// animations.js — アニメーション関連
// ============================================================

class AnimationManager {
  constructor() {
    this.typingElement = null;
    this.typingTexts = [];
    this.typingIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.typingSpeed = 80;
    this.observers = [];
  }

  // ----- タイピングアニメーション -----
  startTyping(elementId, texts) {
    this.typingElement = document.getElementById(elementId);
    if (!this.typingElement) return;
    this.typingTexts = texts;
    this.typingIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.typeLoop();
  }

  typeLoop() {
    if (!this.typingElement) return;

    const currentText = this.typingTexts[this.typingIndex];

    if (this.isDeleting) {
      this.charIndex--;
      this.typingSpeed = 40;
    } else {
      this.charIndex++;
      this.typingSpeed = 80 + Math.random() * 40;
    }

    this.typingElement.textContent = currentText.substring(0, this.charIndex);

    if (!this.isDeleting && this.charIndex === currentText.length) {
      this.typingSpeed = 2000; // 表示後の待機
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.typingIndex = (this.typingIndex + 1) % this.typingTexts.length;
      this.typingSpeed = 500; // 次のテキストへの待機
    }

    setTimeout(() => this.typeLoop(), this.typingSpeed);
  }

  // ----- スクロール連動アニメーション -----
  initScrollReveal() {
    // 既存のオブザーバーをクリーンアップ
    this.destroyObservers();

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          // スタガーアニメーション（子要素の順番遅延）
          const staggerItems = entry.target.querySelectorAll(".stagger-item");
          staggerItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 100}ms`;
            item.classList.add("revealed");
          });
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    this.observers.push(observer);
  }

  // ----- カードチルトエフェクト -----
  initTiltEffect() {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      // ページ遷移のたびに二重登録しないようにする
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      });
    });
  }

  // ----- プログレスバーアニメーション -----
  animateProgressBars() {
    document.querySelectorAll(".skill-progress-fill").forEach((bar) => {
      const targetWidth = bar.getAttribute("data-level");
      // リセットしてからアニメーション
      bar.style.width = "0%";
      setTimeout(() => {
        bar.style.width = targetWidth + "%";
      }, 300);
    });
  }

  // ----- カウンター アニメーション -----
  animateCounter(element, target, duration = 1500) {
    let start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(eased * target);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(update);
  }

  // ----- ページ遷移アニメーション (Cinematic Wipe) -----
  async pageTransition(outElement, inElement) {
    const transitionLayer = document.querySelector(".page-transition");
    if (!transitionLayer) return;

    // 1. カーテンを引き上げる (Slide in)
    transitionLayer.classList.add("slide-in");
    await this.wait(400); // カーテンが画面を覆うのを待つ

    // 2. DOM要素の切り替え（裏側で）
    if (outElement) {
      outElement.classList.remove("active", "page-exit");
    }
    if (inElement) {
      inElement.classList.add("active");
    }

    // 3. カーテンをさらに上へ引き抜く (Slide out)
    transitionLayer.classList.add("slide-out");
    await this.wait(600); // 抜けきるのを待つ

    // 4. クリーンアップ（位置リセット）
    transitionLayer.style.transition = "none";
    transitionLayer.classList.remove("slide-in", "slide-out");
    // リフローさせてからトランジションを戻す
    void transitionLayer.offsetWidth;
    transitionLayer.style.transition = "";
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ----- クリーンアップ -----
  destroyObservers() {
    this.observers.forEach((obs) => obs.disconnect());
    this.observers = [];
  }
}
