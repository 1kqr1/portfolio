// ============================================================
// particles.js — Canvas パーティクル背景
// ============================================================

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;

    this.resize();
    this.init();
    this.animate();

    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener("mouseout", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // タブが非表示のあいだは描画を止める（バッテリー・CPU節約）
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.destroy();
      } else if (!this.animationId) {
        this.animate();
      }
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.init();
  }

  init() {
    this.particles = [];
    const numberOfParticles = Math.floor(
      (this.canvas.width * this.canvas.height) / 12000
    );
    const count = Math.min(numberOfParticles, 120);

    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this.canvas));
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle) => {
      particle.update(this.mouse);
      particle.draw(this.ctx);
    });

    this.connectParticles();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  connectParticles() {
    const maxDistance = 120;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance;
          this.ctx.strokeStyle = `rgba(0, 255, 170, ${opacity * 0.15})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.baseSpeedX = (Math.random() - 0.5) * 0.5;
    this.baseSpeedY = (Math.random() - 0.5) * 0.5;
    this.speedX = this.baseSpeedX;
    this.speedY = this.baseSpeedY;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.pulseSpeed = Math.random() * 0.02 + 0.005;
    this.pulseOffset = Math.random() * Math.PI * 2;
  }

  update(mouse) {
    // マウスインタラクション
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.speedX = this.baseSpeedX + Math.cos(angle) * force * 2;
        this.speedY = this.baseSpeedY + Math.sin(angle) * force * 2;
      } else {
        this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
        this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
      }
    } else {
      this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
      this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
    }

    this.x += this.speedX;
    this.y += this.speedY;

    // 画面端での折り返し
    if (this.x > this.canvas.width + 10) this.x = -10;
    if (this.x < -10) this.x = this.canvas.width + 10;
    if (this.y > this.canvas.height + 10) this.y = -10;
    if (this.y < -10) this.y = this.canvas.height + 10;
  }

  draw(ctx) {
    const pulse =
      Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 0.3 + 0.7;
    const currentOpacity = this.opacity * pulse;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 170, ${currentOpacity})`;
    ctx.fill();

    // グロー効果
    if (this.size > 1.2) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 170, ${currentOpacity * 0.08})`;
      ctx.fill();
    }
  }
}
