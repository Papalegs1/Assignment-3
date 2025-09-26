(function () {
    const PRICE_BY_DISH = {
      "Latte": 4.75,
      "Toasted Bagel": 2.50,
      "Blueberry Muffin": 3.25,
      "Fresh Spring Rolls": 6.95,
      "Pho": 12.50,
      "Tofu Curry": 11.25,
      "Spicy Tuna Roll": 8.95,
      "Teriyaki Bowl": 12.95,
      "Mochi": 4.50
    };
  
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const money = (n) => `$${Number(n).toFixed(2)}`;
  
    const favorites = new Map();
  
    function makeKey(card) {
      const restaurant = card.closest("article.restaurant")?.id ?? "unknown";
      const name = card.dataset.name || $("h4", card)?.textContent.trim() || "Unknown";
      return `${restaurant}::${name}`;
    }
  
    function ensureFavoritesPanel() {
      if ($("#favorites-panel")) return $("#favorites-panel");
  
      const main = $("#main-content") || document.body;
  
      const panel = document.createElement("section");
      panel.id = "favorites-panel";
      panel.setAttribute("aria-labelledby", "favorites-heading");
  
      const h2 = document.createElement("h2");
      h2.id = "favorites-heading";
      h2.textContent = "Favorites Summary";
  
      const desc = document.createElement("p");
      desc.className = "favorites-empty";
      desc.textContent = "No favorites yet. Click “Add to Favorites” on any dish.";
  
      const list = document.createElement("ul");
      list.className = "favorites-list";
      list.setAttribute("role", "list");
  
      const total = document.createElement("p");
      total.className = "favorites-total";
      total.textContent = "Total: $0.00";
  
      panel.appendChild(h2);
      panel.appendChild(desc);
      panel.appendChild(list);
      panel.appendChild(total);
  
      const footer = document.querySelector("footer");
      if (footer && footer.parentElement === document.body) {
        document.body.insertBefore(panel, footer);
      } else {
        main.appendChild(panel);
      }
      return panel;
    }
  
    function updateSummaryUI() {
      const panel = ensureFavoritesPanel();
      const list = $(".favorites-list", panel);
      const empty = $(".favorites-empty", panel);
      const total = $(".favorites-total", panel);
  
      let sum = 0;
      favorites.forEach(({ price }) => (sum += price));
  
      total.textContent = `Total: ${money(sum)}`;
  
      if (favorites.size === 0) {
        if (!empty) {
          const msg = document.createElement("p");
          msg.className = "favorites-empty";
          msg.textContent = "No favorites yet. Click “Add to Favorites” on any dish.";
          panel.insertBefore(msg, list);
        }
      } else if (empty) {
        empty.remove();
      }
    }
  
    function addFavorite(card, btn) {
      const key = makeKey(card);
      if (favorites.has(key)) return;
  
      const name = card.dataset.name;
      const price = Number(card.dataset.price);
  
      const panel = ensureFavoritesPanel();
      const list = $(".favorites-list", panel);
      const li = document.createElement("li");
      const nameNode = document.createElement("span");
      nameNode.textContent = name;
      const sep = document.createTextNode(" — ");
      const priceNode = document.createElement("span");
      priceNode.textContent = money(price);
      li.appendChild(nameNode);
      li.appendChild(sep);
      li.appendChild(priceNode);
      list.appendChild(li);
  
      card.classList.add("is-favorite");
      btn.textContent = "Remove from Favorites";
      btn.setAttribute("aria-pressed", "true");
  
      favorites.set(key, { name, price, li, card, btn });
      updateSummaryUI();
    }
  
    function removeFavorite(card, btn) {
      const key = makeKey(card);
      const entry = favorites.get(key);
      if (!entry) return;
  
      if (entry.li && entry.li.parentElement) {
        entry.li.parentElement.removeChild(entry.li);
      }
  
      card.classList.remove("is-favorite");
      btn.textContent = "Add to Favorites";
      btn.setAttribute("aria-pressed", "false");
  
      favorites.delete(key);
      updateSummaryUI();
    }
  
    function toggleFavorite(card, btn) {
      if (card.classList.contains("is-favorite")) {
        removeFavorite(card, btn);
      } else {
        addFavorite(card, btn);
      }
    }
  
    function attachControlsToCard(card) {
      const titleEl = $("h4", card);
      const name = titleEl ? titleEl.textContent.trim() : "Unknown";
      const price = PRICE_BY_DISH[name] ?? 0;
  
      card.dataset.name = name;
      card.dataset.price = String(price.toFixed(2));
      card.dataset.key = makeKey(card);
  
      const priceTag = document.createElement("span");
      priceTag.className = "price-tag";
      priceTag.setAttribute("aria-label", "Price");
      priceTag.textContent = money(price);
  
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-fav";
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = "Add to Favorites";
      btn.addEventListener("click", () => toggleFavorite(card, btn));
  
      let controls = $(".controls", card);
      if (!controls) {
        controls = document.createElement("div");
        controls.className = "controls";
        card.appendChild(controls);
      }
  
      if (titleEl && titleEl.nextSibling) {
        card.insertBefore(priceTag, titleEl.nextSibling);
      } else if (titleEl) {
        card.appendChild(priceTag);
      } else {
        controls.appendChild(priceTag);
      }
  
      controls.appendChild(btn);
    }
  
    function init() {
      $$(".card-grid .card").forEach(attachControlsToCard);
      ensureFavoritesPanel();
      updateSummaryUI();
    }
  
    document.addEventListener("DOMContentLoaded", init);
  })();
  
  