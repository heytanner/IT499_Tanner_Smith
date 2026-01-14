/* MyStore demo e-commerce logic (static, no backend)
   - Cart stored in localStorage
   - Fake checkout creates an order stored in localStorage
*/

const LS_CART_KEY = "mystore_cart_v1";
const LS_ORDER_KEY = "mystore_last_order_v1";
const LS_CHAT_KEY = "mystore_chat_v1";

const PRODUCTS = [
  { id:"p1", name:"Wireless Headphones", price:79.99, category:"electronics", img:"assets/sample1.png", desc:"Comfortable over-ear headphones with crisp sound." },
  { id:"p2", name:"Smart Watch", price:129.99, category:"electronics", img:"assets/sample2.png", desc:"Fitness tracking, notifications, and sleek design." },
  { id:"p3", name:"Laptop Stand", price:29.99, category:"office", img:"assets/sample3.png", desc:"Ergonomic aluminum stand for better posture." },
  { id:"p4", name:"USB-C Hub", price:39.99, category:"accessories", img:"assets/sample4.png", desc:"Expand ports: HDMI, USB-A, SD, and more." },
];

function money(n){ return `$${Number(n).toFixed(2)}`; }

function getCart(){
  try { return JSON.parse(localStorage.getItem(LS_CART_KEY)) || []; }
  catch { return []; }
}
function setCart(cart){
  localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
  updateCartBadges();
}
function cartCount(cart=getCart()){
  return cart.reduce((sum, it) => sum + it.qty, 0);
}
function cartSubtotal(cart=getCart()){
  return cart.reduce((sum, it) => sum + it.qty * it.price, 0);
}

function updateCartBadges(){
  const count = cartCount();
  const el1 = document.getElementById("cart-count");
  const el2 = document.getElementById("cart-count-mobile");
  if (el1) el1.textContent = String(count);
  if (el2) el2.textContent = String(count);
}

function findProduct(id){
  return PRODUCTS.find(p => p.id === id);
}

function addToCart(productId, qty=1){
  const p = findProduct(productId);
  if (!p) return;
  const cart = getCart();
  const existing = cart.find(it => it.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id:p.id, name:p.name, price:p.price, img:p.img, qty });
  setCart(cart);
  toast(`Added to cart: ${p.name}`);
}

function removeFromCart(productId){
  const cart = getCart().filter(it => it.id !== productId);
  setCart(cart);
  renderCartIfPresent();
}
function setQty(productId, newQty){
  const cart = getCart();
  const it = cart.find(i => i.id === productId);
  if (!it) return;
  it.qty = Math.max(1, Math.min(99, newQty));
  setCart(cart);
  renderCartIfPresent();
}

function clearCartConfirm(){
  if (!confirm("Clear all items from your cart?")) return;
  localStorage.removeItem(LS_CART_KEY);
  updateCartBadges();
  renderCartIfPresent();
  toast("Cart cleared.");
}

function goCheckout(){
  const cart = getCart();
  if (cart.length === 0){
    alert("Your cart is empty. Add items before checking out.");
    return;
  }
  window.location.href = "checkout.html";
}

function renderFeatured(){
  const grid = document.getElementById("featured-grid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.slice(0,4).map(p => productCardHTML(p, true)).join("");
}

function renderCategory(){
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat") || "all";
  renderGrid(cat);

  // highlight filters? keep simple
}

function filterCategory(cat){
  const url = new URL(window.location.href);
  if (cat === "all") url.searchParams.delete("cat");
  else url.searchParams.set("cat", cat);
  window.location.href = url.toString();
}

function renderGrid(cat){
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const list = (cat === "all") ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
  grid.innerHTML = list.map(p => productCardHTML(p, false)).join("");
}

function productCardHTML(p, includeViewAll){
  const viewLink = `pages/product.html?id=${encodeURIComponent(p.id)}`;
  const viewLinkInner = `product.html?id=${encodeURIComponent(p.id)}`;
  // If we're on root, links need pages/ prefix; on pages, they don't
  const onRoot = window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/project-root/");
  const link = onRoot ? viewLink : viewLinkInner;

  const img = onRoot ? p.img : `../${p.img}`;
  return `
    <article class="product-card">
      <img src="${img}" alt="${escapeHTML(p.name)}">
      <div class="pc-body">
        <h3>${escapeHTML(p.name)}</h3>
        <div class="price">${money(p.price)}</div>
        <div class="actions">
          <a class="btn" href="${link}">View</a>
          <button class="btn primary" type="button" onclick="addToCart('${p.id}', 1)">Add</button>
        </div>
      </div>
    </article>
  `;
}

function renderProductPage(){
  const wrap = document.getElementById("product-page");
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "p1";
  const p = findProduct(id) || PRODUCTS[0];

  const img = `../${p.img}`;

  wrap.innerHTML = `
    <div class="media">
      <img src="${img}" alt="${escapeHTML(p.name)}">
    </div>
    <div class="details card">
      <h2>${escapeHTML(p.name)}</h2>
      <div class="price">${money(p.price)}</div>
      <p class="muted">${escapeHTML(p.desc)}</p>
      <div class="actions">
        <button class="btn primary" type="button" onclick="addToCart('${p.id}', 1)">Add to Cart</button>
        <a class="btn" href="cart.html">Go to Cart</a>
      </div>
      <div class="muted small" style="margin-top:10px;">Tip: This is a demo product page.</div>
    </div>
  `;
}

function renderCartIfPresent(){
  const itemsEl = document.getElementById("cart-items");
  if (!itemsEl) return; // not on cart page

  const cart = getCart();
  const emptyEl = document.getElementById("cart-empty");
  if (emptyEl) emptyEl.style.display = cart.length ? "none" : "block";

  itemsEl.innerHTML = cart.map(it => {
    const img = `../${it.img}`;
    return `
      <div class="cart-item">
        <img src="${img}" alt="${escapeHTML(it.name)}">
        <div>
          <div style="font-weight:900">${escapeHTML(it.name)}</div>
          <div class="muted">${money(it.price)} each</div>
          <div class="qty" style="margin-top:8px;">
            <button class="btn" type="button" onclick="setQty('${it.id}', ${it.qty-1})">−</button>
            <span>${it.qty}</span>
            <button class="btn" type="button" onclick="setQty('${it.id}', ${it.qty+1})">+</button>
            <button class="btn" type="button" onclick="removeFromCart('${it.id}')">Remove</button>
          </div>
        </div>
        <div style="font-weight:900">${money(it.price * it.qty)}</div>
      </div>
    `;
  }).join("");

  // summary
  const subtotal = cartSubtotal(cart);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const itemsCount = cartCount(cart);

  setText("summary-items", String(itemsCount));
  setText("summary-subtotal", money(subtotal));
  setText("summary-tax", money(tax));
  setText("cart-total", money(total));
}

function renderCheckoutSummary(){
  const form = document.getElementById("checkout-form");
  if (!form) return;

  const cart = getCart();
  if (cart.length === 0){
    alert("Your cart is empty. Returning to Shop.");
    window.location.href = "category.html";
    return;
  }

  const subtotal = cartSubtotal(cart);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  setText("co-items", String(cartCount(cart)));
  setText("co-subtotal", money(subtotal));
  setText("co-tax", money(tax));
  setText("co-total", money(total));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    completeCheckout(total);
  }, { once: true });
}

function completeCheckout(total){
  // Generate a simple order ID
  const now = new Date();
  const id = `MS-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000+1000)}`;

  const order = {
    id,
    createdAt: now.toISOString(),
    status: "Processing",
    total: Number(total.toFixed(2)),
    items: getCart()
  };
  localStorage.setItem(LS_ORDER_KEY, JSON.stringify(order));

  // clear cart
  localStorage.removeItem(LS_CART_KEY);
  updateCartBadges();

  // confirmation + redirect
  alert(`Order placed! Your Order ID is ${id}`);
  window.location.href = `order-confirmation.html?orderId=${encodeURIComponent(id)}`;
}

function fillConfirmation(){
  const el = document.getElementById("confirm-order-id");
  if (!el) return;

  const params = new URLSearchParams(window.location.search);
  const qid = params.get("orderId");

  const order = getLastOrder();
  const id = qid || order?.id || "—";
  const total = order?.total ?? 0;

  el.textContent = id;
  setText("confirm-total", money(total));
}

function getLastOrder(){
  try { return JSON.parse(localStorage.getItem(LS_ORDER_KEY)); }
  catch { return null; }
}

function trackOrder(){
  const input = document.getElementById("order-id-input");
  const view = document.getElementById("order-status-view");
  const none = document.getElementById("no-order");
  if (!view || !none) return;

  const typed = (input?.value || "").trim();
  const order = getLastOrder();

  const idToCheck = typed || order?.id;
  if (!idToCheck || !order || order.id !== idToCheck){
    view.style.display = "none";
    none.style.display = "block";
    return;
  }

  none.style.display = "none";
  view.style.display = "block";
  view.innerHTML = `
    <div class="row"><span>Order ID</span><strong>${escapeHTML(order.id)}</strong></div>
    <div class="row"><span>Placed</span><strong>${new Date(order.createdAt).toLocaleString()}</strong></div>
    <div class="row"><span>Status</span><strong>${escapeHTML(order.status)}</strong></div>
    <div class="row total"><span>Total</span><strong>${money(order.total)}</strong></div>
    <hr style="border:0;border-top:1px solid rgba(255,255,255,.08); margin:12px 0;">
    <div class="muted small">Items</div>
    <ul class="bullets">
      ${order.items.map(i => `<li>${escapeHTML(i.name)} × ${i.qty}</li>`).join("")}
    </ul>
  `;
}

function initSupportForm(){
  const form = document.getElementById("support-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Support request submitted! A representative will respond (demo).");
    window.location.href = "chat.html";
  });
}

function initChat(){
  const box = document.getElementById("chat-box");
  if (!box) return;

  // Load existing conversation
  const messages = getChat();
  if (!messages.length){
    messages.push({ from:"bot", text:"Hi! I'm ShopLite Support. How can I help today?" });
    setChat(messages);
  }
  renderChat();
}

function getChat(){
  try { return JSON.parse(localStorage.getItem(LS_CHAT_KEY)) || []; }
  catch { return []; }
}
function setChat(msgs){
  localStorage.setItem(LS_CHAT_KEY, JSON.stringify(msgs));
}

function renderChat(){
  const box = document.getElementById("chat-box");
  if (!box) return;
  const msgs = getChat();
  box.innerHTML = msgs.map(m => `
    <div class="chat-bubble ${m.from === "user" ? "user" : "bot"}">${escapeHTML(m.text)}</div>
  `).join("");
  box.scrollTop = box.scrollHeight;
}

function sendMessage(){
  const input = document.getElementById("chat-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const msgs = getChat();
  msgs.push({ from:"user", text });
  input.value = "";
  setChat(msgs);
  renderChat();

  // Simple bot reply
  setTimeout(() => {
    const reply = demoBotReply(text);
    const msgs2 = getChat();
    msgs2.push({ from:"bot", text: reply });
    setChat(msgs2);
    renderChat();
  }, 450);
}

function demoBotReply(text){
  const t = text.toLowerCase();
  if (t.includes("order")){
    const order = getLastOrder();
    if (order) return `Your latest order is ${order.id} and it's currently "${order.status}". You can also track it on the Orders page.`;
    return "I don't see a recent order. Try completing checkout, then track it on the Orders page.";
  }
  if (t.includes("refund")) return "For this demo, refunds are not processed — but in a real site this would open a return flow.";
  return "Thanks! In a real store, I'd open a support ticket. For now, try browsing the Shop or checking your Cart.";
}

function demoSearch(){
  const input = document.getElementById("search-input");
  const q = (input?.value || "").trim();
  if (!q){
    toast("Type something to search (demo).");
    return;
  }
  alert(`Demo search for: "${q}"\n\nIn a real site, this would filter products.`);
}

function toggleMobileNav(){
  const nav = document.getElementById("mobile-nav");
  if (!nav) return;
  nav.style.display = (nav.style.display === "block") ? "none" : "block";
}

function toast(msg){
  // lightweight toast
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.bottom = "18px";
  t.style.transform = "translateX(-50%)";
  t.style.padding = "10px 12px";
  t.style.borderRadius = "14px";
  t.style.background = "rgba(0,0,0,.75)";
  t.style.color = "white";
  t.style.border = "1px solid rgba(255,255,255,.2)";
  t.style.zIndex = "9999";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1500);
}

function setText(id, value){
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHTML(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadges();

  renderFeatured();
  renderCategory();
  renderProductPage();
  renderCartIfPresent();
  renderCheckoutSummary();
  fillConfirmation();
  initSupportForm();
  initChat();

  // If on order-status page, auto-fill latest order id
  const order = getLastOrder();
  const input = document.getElementById("order-id-input");
  if (input && order?.id) input.value = order.id;
});
