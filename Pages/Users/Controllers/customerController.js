import { phoneService } from "../../../Shared/Api/phone.service.js";
import Product from "../../../Shared/modals/Products.js";

/*  GLOBAL STATE */
let products = []; // mảng Product load từ API thật
let filtered = []; // mảng đang hiển thị
let cart = JSON.parse(localStorage.getItem("cart_v1") || "[]");

/* HELPERS */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function formatVND(n) {
  const num = typeof n === "number" ? n : Number(n) || 0;
  return num.toLocaleString("vi-VN") + " ₫";
}

// Chuẩn hoá object từ API -> shape cho Product model
function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name ?? p.productName ?? p.title ?? "",
    price: Number(p.price ?? p.cost ?? 0),
    category: p.category ?? p.type ?? "Khác",
    img: p.img ?? p.image ?? p.thumbnail ?? "",
    desc: p.desc ?? p.description ?? "",
  };
}

/* 1) Render product grid */
export async function initShop() {
  try {
    const res = await phoneService.getList();      // <- DÙNG API CHUNG
    products = res.data.map((p) => new Product(normalizeProduct(p)));
    filtered = products.slice();
    renderCategories();
    renderProducts(filtered);
    renderCart();
  } catch (err) {
    console.error("Lỗi load sản phẩm:", err);
    $("#productList").innerHTML = "<p>Không thể tải sản phẩm.</p>";
  }

  // search
  $("#searchInput").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );
    renderProducts(filtered);
  });

  // sort
  $("#sortSelect").addEventListener("change", (e) => {
    const v = e.target.value;
    if (v === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (v === "price-desc") filtered.sort((a, b) => b.price - a.price);
    renderProducts(filtered);
  });
}

/* 2) Render categories dropdown (dynamic) */
function renderCategories() {
  const cats = ["Tất cả", ...new Set(products.map((p) => p.category))];
  $("#categorySelect").innerHTML = cats
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");
  $("#categorySelect").addEventListener("change", (e) => {
    const val = e.target.value;
    filtered = val === "Tất cả" ? products.slice() : products.filter((p) => p.category === val);
    renderProducts(filtered);
  });
}

/* 3) Render product cards */
function renderProducts(list) {
  const container = $("#productList");
  if (!list.length) {
    container.innerHTML = `<p class="empty">Không tìm thấy sản phẩm</p>`;
    return;
  }
  container.innerHTML = list
    .map(
      (p) => `
    <article class="card" data-id="${p.id}">
      <div class="card-thumb">
        <img src="${p.img}" alt="${p.name}">
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.name}</h3>
        <p class="card-price">${formatVND(p.price)}</p>
        <p class="card-desc">${p.desc}</p>
        <div class="card-actions">
          <button class="btn btn-outline btn-detail" data-id="${p.id}">Xem</button>
          <button class="btn btn-primary btn-add" data-id="${p.id}">Thêm vào giỏ</button>
        </div>
      </div>
    </article>`
    )
    .join("");

  // attach events (delegation)
  $$(".btn-add").forEach((btn) => (btn.onclick = () => addToCart(btn.dataset.id)));
  $$(".btn-detail").forEach((btn) => (btn.onclick = () => openDetail(btn.dataset.id)));
}

/* 4) Product detail modal */
function openDetail(id) {
  const p = products.find((x) => x.id == id);
  if (!p) return;
  $("#modalTitle").textContent = p.name;
  $("#modalImg").src = p.img;
  $("#modalPrice").textContent = formatVND(p.price);
  $("#modalDesc").textContent = p.desc;
  $("#modalAddBtn").dataset.id = p.id;
  $("#modal").classList.add("open");
}
$("#modalClose").addEventListener("click", () =>
  $("#modal").classList.remove("open")
);
$("#modalAddBtn").addEventListener("click", (e) => {
  addToCart(e.target.dataset.id);
  $("#modal").classList.remove("open");
});

/* 5) CART FUNCTIONS */
function saveCart() {
  localStorage.setItem("cart_v1", JSON.stringify(cart));
}
function addToCart(id) {
  const p = products.find((x) => x.id == id);
  if (!p) return;
  const idx = cart.findIndex((i) => i.id == id);
  if (idx >= 0) cart[idx].qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
  saveCart();
  renderCart();
  flashCartCount();
}
function changeQty(id, delta) {
  const idx = cart.findIndex((i) => i.id == id);
  if (idx < 0) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
}
function removeFromCart(id) {
  cart = cart.filter((i) => i.id != id);
  saveCart();
  renderCart();
}
function getCartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}
function flashCartCount() {
  const n = cart.reduce((s, i) => s + i.qty, 0);
  $("#cartCount").textContent = n || "";
}

/* 6) Render cart sidebar */
export function toggleCartSidebar(show) {
  $("#cartSidebar").classList.toggle("open", show);
}
function renderCart() {
  const cont = $("#cartItems");
  if (!cart.length) {
    cont.innerHTML = `<p class="empty">Giỏ hàng trống</p>`;
    $("#cartSummary").innerHTML = "";
    $("#checkoutBtn").disabled = true;
    $("#cartCount").textContent = "";
    return;
  }
  cont.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-row">
      <img src="${item.img}" alt="${item.name}">
      <div class="meta">
        <div class="name">${item.name}</div>
        <div class="price">${formatVND(item.price)}</div>
        <div class="qty">
          <button class="small" data-id="${item.id}" data-delta="-1">-</button>
          <span>${item.qty}</span>
          <button class="small" data-id="${item.id}" data-delta="1">+</button>
          <button class="remove" data-id="${item.id}">Xóa</button>
        </div>
      </div>
      <div class="row-total">${formatVND(item.price * item.qty)}</div>
    </div>`
    )
    .join("");

  // bind cart controls
  $$("#cartItems .small").forEach((btn) => {
    btn.onclick = () => changeQty(btn.dataset.id, Number(btn.dataset.delta));
  });
  $$("#cartItems .remove").forEach((btn) => {
    btn.onclick = () => removeFromCart(btn.dataset.id);
  });
  $("#cartSummary").innerHTML = `
    <div class="summary-line">
      <span>Tổng</span>
      <strong>${formatVND(getCartTotal())}</strong>
    </div>`;
  $("#checkoutBtn").disabled = false;
  flashCartCount();
}

/* 7) Checkout -> clear cart (mô phỏng) */
$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return alert("Giỏ hàng trống");
  alert("Thanh toán thành công! Tổng: " + formatVND(getCartTotal()));
  cart = [];
  saveCart();
  renderCart();
  toggleCartSidebar(false);
});

/* Init: mount để HTML gọi */
window.shop = { initShop, toggleCartSidebar };

document.getElementById("policyCheck").addEventListener("change", (e) => {
  document.getElementById("checkoutBtn").disabled = !e.target.checked;
});

