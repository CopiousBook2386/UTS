// === Globals ===
const CART_KEY = "shop9_cart_v1";
const cartToggle = document.getElementById("cartToggle");
const cartSidebar = document.getElementById("cartSidebar");
const overlay = document.getElementById("overlay");
const closeCartBtn = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || {};

// helper: parse price text "Rp 1.234.000" -> number
function parsePriceText(text) {
  return parseInt(text.replace(/[^\d]/g, "")) || 0;
}

// render cart (UI & save)
function saveAndRenderCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  let count = 0;
  for (const key in cart) {
    const it = cart[key];
    const subtotal = it.price * it.quantity;
    total += subtotal;
    count += it.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.style.marginBottom = "8px";
    div.innerHTML = `<strong>${it.name}</strong> <div>(${it.quantity}x) • Rp ${subtotal.toLocaleString()}</div>`;
    cartItemsEl.appendChild(div);
  }
  cartTotalEl.textContent = "Rp " + total.toLocaleString();
  cartCountEl.textContent = count;
}

// add item to cart (from DOM product card)
function addToCartFromCard(cardEl) {
  const name = cardEl.querySelector(".name").innerText;
  const priceText = cardEl.querySelector(".price").innerText;
  const price = parsePriceText(priceText);
  const stockSpan = cardEl.querySelector(".stock-count");
  let stock = parseInt(stockSpan.innerText);

  if (stock <= 0) {
    alert(`${name} sudah habis stoknya!`);
    return;
  }

  // kurangi stok di DOM
  stock -= 1;
  stockSpan.innerText = stock;

  // update cart object
  if (!cart[name]) cart[name] = { name, price, quantity: 1 };
  else cart[name].quantity += 1;

  saveAndRenderCart();
  alert(`${name} ditambahkan ke keranjang`);
}

// wire up add-to-cart buttons
function bindAddButtons() {
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.removeEventListener("click", btn.__shop9_listener);
    const listener = () => addToCartFromCard(btn.closest(".items"));
    btn.addEventListener("click", listener);
    btn.__shop9_listener = listener;
  });
}

// Filter price on current page
const applyFilter = document.getElementById("applyFilter");
const resetFilter = document.getElementById("resetFilter");
if (applyFilter) {
  applyFilter.addEventListener("click", () => {
    const min = parseInt(document.getElementById("minPrice").value) || 0;
    const max = parseInt(document.getElementById("maxPrice").value) || Infinity;
    document.querySelectorAll(".items").forEach(card => {
      const price = parsePriceText(card.querySelector(".price").innerText);
      card.style.display = (price >= min && price <= max) ? "" : "none";
    });
  });
}
if (resetFilter) {
  resetFilter.addEventListener("click", () => {
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    document.querySelectorAll(".items").forEach(card => card.style.display = "");
  });
}

// cart sidebar toggle
if (cartToggle) {
  cartToggle.addEventListener("click", () => {
    cartSidebar.classList.add("open");
    overlay.classList.add("show");
  });
}
if (closeCartBtn) closeCartBtn.addEventListener("click", () => {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("show");
});
if (overlay) overlay.addEventListener("click", () => {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("show");
});

// clear cart
if (clearCartBtn) clearCartBtn.addEventListener("click", () => {
  if (confirm("Kosongkan keranjang?")) {
    cart = {};
    saveAndRenderCart();
  }
});

// checkout (simple)
if (checkoutBtn) checkoutBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) { alert("Keranjang kosong."); return; }
  alert("Terima kasih! (Ini demo — integrasi pembayaran belum tersedia.)");
  // optional: clear cart after checkout
  cart = {};
  saveAndRenderCart();
});

// search input (simple filter by name)
document.querySelectorAll('#searchInput').forEach(si => {
  si.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".items").forEach(card => {
      const name = card.querySelector(".name").innerText.toLowerCase();
      card.style.display = name.includes(q) ? "" : "none";
    });
  });
});

// init
bindAddButtons();
renderCart();

// Ensure newly loaded pages bind buttons (if SPA navigation not used, this runs on each page load)
window.addEventListener("DOMContentLoaded", () => {
  bindAddButtons();
  renderCart();
});
