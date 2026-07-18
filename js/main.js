/* 作品カードの描画と、カテゴリでの絞り込み */
(function () {
  "use strict";

  const grid = document.getElementById("grid");
  const filtersEl = document.getElementById("filters");
  const emptyEl = document.getElementById("empty");

  // ストレージからデータを取得（localStorage → works.js フォールバック）
  const works = WorksStorage.loadWorks();
  const categories = WorksStorage.loadCategories();

  // カテゴリのラベルを引くための対応表
  const catLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));

  let current = "all";

  // --- 1枚のカードを組み立てる ---
  function cardHTML(w) {
    const media = w.image
      ? `<img class="card__img" src="${w.image}" alt="${w.title} のスクリーンショット" loading="lazy" />`
      : `<span class="card__emoji" aria-hidden="true">${w.emoji || "🧩"}</span>`;

    const tags = (w.tags || [])
      .map((t) => `<li class="tag">${t}</li>`)
      .join("");

    const links = (w.links || [])
      .filter((l) => l.url && l.url !== "#")
      .map(
        (l) =>
          `<a class="card__link" href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`
      )
      .join("");

    const year = w.year ? `<span class="card__year">${w.year}</span>` : "";
    const accent = w.accent || "#4f46e5";

    return `
      <article class="card" data-category="${w.category}">
        <div class="card__media" style="--accent:${accent}">${media}</div>
        <div class="card__body">
          <div class="card__meta">
            <span class="card__cat">${catLabel[w.category] || "その他"}</span>
            ${year}
          </div>
          <h3 class="card__title">${w.title}</h3>
          <p class="card__desc">${w.description}</p>
          ${tags ? `<ul class="card__tags">${tags}</ul>` : ""}
          ${links ? `<div class="card__links">${links}</div>` : ""}
        </div>
      </article>`;
  }

  // --- 絞り込んで描画 ---
  function render() {
    const list =
      current === "all" ? works : works.filter((w) => w.category === current);

    grid.innerHTML = list.map(cardHTML).join("");
    emptyEl.hidden = list.length !== 0;
  }

  // --- カテゴリボタンを作る（そのカテゴリに作品がある場合だけ表示）---
  function buildFilters() {
    const used = new Set(works.map((w) => w.category));
    const shown = categories.filter((c) => c.id === "all" || used.has(c.id));

    filtersEl.innerHTML = shown
      .map(
        (c) =>
          `<button class="filter" type="button" data-cat="${c.id}" aria-pressed="${
            c.id === current
          }">${c.label}</button>`
      )
      .join("");

    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      current = btn.dataset.cat;
      filtersEl
        .querySelectorAll(".filter")
        .forEach((b) => b.setAttribute("aria-pressed", b === btn));
      render();
    });
  }

  buildFilters();
  render();
  document.getElementById("year").textContent = new Date().getFullYear();
})();
