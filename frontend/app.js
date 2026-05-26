const API_BASE_URL = "http://localhost:8080/api";

const pageTitle = document.getElementById("page-title");
const appView = document.getElementById("app-view");
const navLinks = document.querySelectorAll(".nav-link");

let productsCache = [];
let editingProductId = null;
let inventoryCache = [];
let lowStockCache = [];
let billingProductsCache = [];
let billingCart = [];
let suppliersCache = [];
let reportsSummaryCache = null;
let reportsTopProductsCache = [];
let reportsDailySalesCache = [];
let topProductsChartInstance = null;
let dailySalesChartInstance = null;
let editingSupplierId = null;

function setActiveNav(route) {
  navLinks.forEach(link => {
    const href = link.getAttribute("href").replace("#", "");
    link.classList.toggle("active", href === route);
  });
}

function dashboardTemplate() {
  return `
    <section class="glass-panel hero-tilt">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Grocery Store Management</p>
          <h3>Premium light-themed control panel for your store operations.</h3>
          <p>
            This dashboard is designed to feel modern, clean, and slightly three-dimensional,
            not like a generic template. Use the Products page to manage real backend data.
          </p>
        </div>

        <div class="quick-stats">
          <article class="stat-card">
            <span>Total Modules</span>
            <strong>6</strong>
          </article>
          <article class="stat-card">
            <span>Frontend Mode</span>
            <strong>Vanilla JS</strong>
          </article>
          <article class="stat-card">
            <span>Backend Mode</span>
            <strong>Spring Boot</strong>
          </article>
        </div>
      </div>
    </section>
  `;
}

function inventoryTemplate() {
  return `
    <section class="glass-panel hero-tilt">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Inventory Control</p>
          <h3>Track stock health, low inventory, and store value in one place.</h3>
          <p>
            This module gives you a real-time view of stock movement, low-stock alerts,
            and total inventory value using your Spring Boot inventory endpoints.
          </p>
        </div>

        <div class="quick-stats">
          <article class="stat-card">
            <span>Total Products</span>
            <strong id="inventory-total-products">0</strong>
          </article>
          <article class="stat-card">
            <span>Low Stock</span>
            <strong id="inventory-low-stock">0</strong>
          </article>
          <article class="stat-card">
            <span>Out of Stock</span>
            <strong id="inventory-out-of-stock">0</strong>
          </article>
          <article class="stat-card">
            <span>Total Stock Value</span>
            <strong id="inventory-total-value">₹0</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="toolbar-grid">
      <article class="glass-panel list-card">
        <div class="list-topbar">
          <div>
            <h3>Inventory List</h3>
            <p class="eyebrow">Search and manage stock</p>
          </div>

          <input
            type="text"
            id="inventory-search"
            class="search-input"
            placeholder="Search by product or category..."
          />
        </div>

        <div id="inventory-output" class="inventory-grid"></div>
      </article>

      <article class="glass-panel list-card">
        <div class="list-topbar">
          <div>
            <h3>Low Stock Alerts</h3>
            <p class="eyebrow">Items that need attention</p>
          </div>
        </div>

        <div id="low-stock-output" class="alert-list"></div>
      </article>
    </section>
  `;
}

function billingTemplate() {
  return `
    <section class="glass-panel hero-tilt">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Billing / POS</p>
          <h3>Fast grocery checkout with live cart, total, and invoice generation.</h3>
          <p>
            Select products, manage quantities, enter customer name, and generate
            a bill directly through your Spring Boot checkout API.
          </p>
        </div>

        <div class="quick-stats">
          <article class="stat-card">
            <span>Cart Items</span>
            <strong id="billing-cart-count">0</strong>
          </article>
          <article class="stat-card">
            <span>Total Quantity</span>
            <strong id="billing-total-qty">0</strong>
          </article>
          <article class="stat-card">
            <span>Bill Total</span>
            <strong id="billing-total-amount">₹0.00</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="billing-layout">
      <article class="glass-panel billing-products-panel">
        <div class="list-topbar">
          <div>
            <h3>Available Products</h3>
            <p class="eyebrow">Tap to add into cart</p>
          </div>
          <input
            type="text"
            id="billing-search"
            class="search-input"
            placeholder="Search products..."
          />
        </div>

        <div id="billing-products-output" class="billing-products-grid"></div>
      </article>

      <article class="glass-panel billing-cart-panel">
        <div class="list-topbar">
          <div>
            <h3>Current Cart</h3>
            <p class="eyebrow">Live POS summary</p>
          </div>
        </div>

        <div class="field full" style="margin-bottom: 16px;">
          <label for="customer-name">Customer Name</label>
          <input type="text" id="customer-name" placeholder="e.g. Mayank Ninawe" />
        </div>

        <div id="billing-cart-output" class="billing-cart-list"></div>

        <div class="billing-summary">
          <div class="billing-row">
            <span>Items</span>
            <strong id="summary-items">0</strong>
          </div>
          <div class="billing-row">
            <span>Quantity</span>
            <strong id="summary-quantity">0</strong>
          </div>
          <div class="billing-row total-row">
            <span>Total</span>
            <strong id="summary-total">₹0.00</strong>
          </div>
        </div>

        <div class="billing-actions">
          <button class="btn btn-secondary" id="clear-cart-btn" type="button">Clear Cart</button>
          <button class="btn btn-primary" id="checkout-btn" type="button">Checkout Now</button>
        </div>

        <div id="billing-message" class="message-box" style="display:none; margin-top:16px;"></div>
        <div id="invoice-success" class="invoice-success-box" style="display:none;"></div>
      </article>
    </section>
  `;
}

function suppliersTemplate() {
  return `
    <section class="glass-panel hero-tilt">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Suppliers Management</p>
          <h3>Manage supplier contacts, availability, and procurement relationships.</h3>
          <p>
            Add, edit, delete, and search suppliers from your backend API using a
            clean light-themed interface that matches the rest of the system.
          </p>
        </div>

        <div class="quick-stats">
          <article class="stat-card">
            <span>Total Suppliers</span>
            <strong id="suppliers-total-count">0</strong>
          </article>
          <article class="stat-card">
            <span>With Email</span>
            <strong id="suppliers-email-count">0</strong>
          </article>
          <article class="stat-card">
            <span>With Phone</span>
            <strong id="suppliers-phone-count">0</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="toolbar-grid">
      <article class="glass-panel form-card">
        <h3 id="supplier-form-title">Add Supplier</h3>

        <form id="supplier-form">
          <div class="form-grid">
            <div class="field">
              <label for="supplier-name">Supplier Name</label>
              <input type="text" id="supplier-name" name="name" placeholder="e.g. Fresh Farm Supplies" required />
            </div>

            <div class="field">
              <label for="supplier-contact-person">Contact Person</label>
              <input type="text" id="supplier-contact-person" name="contactPerson" placeholder="e.g. Rohit Sharma" />
            </div>

            <div class="field">
              <label for="supplier-email">Email</label>
              <input type="email" id="supplier-email" name="email" placeholder="e.g. freshfarm@example.com" />
            </div>

            <div class="field">
              <label for="supplier-phone">Phone</label>
              <input type="text" id="supplier-phone" name="phone" placeholder="e.g. 9876543210" />
            </div>

            <div class="field full">
              <label for="supplier-address">Address</label>
              <input type="text" id="supplier-address" name="address" placeholder="e.g. Pune, Maharashtra" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="supplier-submit-btn">Save Supplier</button>
            <button type="button" class="btn btn-secondary" id="supplier-reset-btn">Reset</button>
          </div>
        </form>

        <div id="supplier-form-message" class="message-box" style="display:none; margin-top:16px;"></div>
      </article>

      <article class="glass-panel list-card">
        <div class="list-topbar">
          <div>
            <h3>Suppliers List</h3>
            <p class="eyebrow">Search and manage suppliers</p>
          </div>

          <input
            type="text"
            id="supplier-search"
            class="search-input"
            placeholder="Search supplier or contact..."
          />
        </div>

        <div id="suppliers-output" class="suppliers-grid"></div>
      </article>
    </section>
  `;
}

function reportsTemplate() {
  return `
    <section class="glass-panel hero-tilt">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Reports & Analytics</p>
          <h3>Track sales, revenue, stock health, and top-selling products visually.</h3>
          <p>
            This reports dashboard combines backend analytics endpoints with live charts
            so you can quickly understand store performance.
          </p>
        </div>

        <div class="quick-stats">
          <article class="stat-card">
            <span>Total Revenue</span>
            <strong id="reports-total-revenue">₹0.00</strong>
          </article>
          <article class="stat-card">
            <span>Total Invoices</span>
            <strong id="reports-total-invoices">0</strong>
          </article>
          <article class="stat-card">
            <span>Low Stock Items</span>
            <strong id="reports-low-stock">0</strong>
          </article>
          <article class="stat-card">
            <span>Out of Stock</span>
            <strong id="reports-out-stock">0</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="reports-grid">
      <article class="glass-panel report-card">
        <div class="report-card-top">
          <div>
            <h3>Top Selling Products</h3>
            <p class="eyebrow">Quantity sold and revenue leaders</p>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas id="top-products-chart"></canvas>
        </div>
      </article>

      <article class="glass-panel report-card">
        <div class="report-card-top">
          <div>
            <h3>Daily Sales Trend</h3>
            <p class="eyebrow">Invoices and revenue by date</p>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas id="daily-sales-chart"></canvas>
        </div>
      </article>
    </section>

    <section class="toolbar-grid">
      <article class="glass-panel list-card">
        <div class="list-topbar">
          <div>
            <h3>Top Products Table</h3>
            <p class="eyebrow">Backend driven insights</p>
          </div>
        </div>
        <div id="top-products-table" class="report-list"></div>
      </article>

      <article class="glass-panel list-card">
        <div class="list-topbar">
          <div>
            <h3>Daily Sales Table</h3>
            <p class="eyebrow">Recent revenue performance</p>
          </div>
        </div>
        <div id="daily-sales-table" class="report-list"></div>
      </article>
    </section>
  `;
}

function productsTemplate() {
  return `
    <section class="glass-panel hero-tilt">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Products Control</p>
          <h3>Manage grocery products with live backend integration.</h3>
          <p>
            Add, edit, delete, and search products from your Spring Boot REST API.
            Low-stock items are highlighted automatically.
          </p>
        </div>

        <div class="quick-stats">
          <article class="stat-card">
            <span>Total Products</span>
            <strong id="total-products">0</strong>
          </article>
          <article class="stat-card">
            <span>Low Stock Items</span>
            <strong id="low-stock-count">0</strong>
          </article>
          <article class="stat-card">
            <span>Average Price</span>
            <strong id="avg-price">₹0</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="toolbar-grid">
      <article class="glass-panel form-card">
        <h3 id="form-title">Add Product</h3>

        <form id="product-form">
          <div class="form-grid">
            <div class="field">
              <label for="name">Product Name</label>
              <input type="text" id="name" name="name" placeholder="e.g. Milk" required />
            </div>

            <div class="field">
              <label for="category">Category</label>
              <input type="text" id="category" name="category" placeholder="e.g. Dairy" />
            </div>

            <div class="field">
              <label for="price">Price</label>
              <input type="number" id="price" name="price" step="0.01" min="0" placeholder="e.g. 60" required />
            </div>

            <div class="field">
              <label for="unit">Unit</label>
              <input type="text" id="unit" name="unit" placeholder="e.g. 1 L" />
            </div>

            <div class="field">
              <label for="stockQuantity">Stock Quantity</label>
              <input type="number" id="stockQuantity" name="stockQuantity" min="0" placeholder="e.g. 50" />
            </div>

            <div class="field">
              <label for="minStockLevel">Minimum Stock</label>
              <input type="number" id="minStockLevel" name="minStockLevel" min="0" placeholder="e.g. 10" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="submit-btn">Save Product</button>
            <button type="button" class="btn btn-secondary" id="reset-btn">Reset</button>
          </div>
        </form>

        <div id="form-message" class="message-box" style="display:none; margin-top:16px;"></div>
      </article>

      <article class="glass-panel list-card">
        <div class="list-topbar">
          <div>
            <h3>Products List</h3>
            <p class="eyebrow">Live from API</p>
          </div>

          <input
            type="text"
            id="search-products"
            class="search-input"
            placeholder="Search by name or category..."
          />
        </div>

        <div id="products-output" class="product-grid"></div>
      </article>
    </section>
  `;
}

function renderRoute() {
  const route = window.location.hash.replace("#", "") || "dashboard";
  setActiveNav(route);
  pageTitle.textContent = route.charAt(0).toUpperCase() + route.slice(1);

  switch (route) {
    case "products":
      appView.innerHTML = productsTemplate();
      attachProductsEvents();
      loadAndRenderProducts();
      break;
    case "inventory":
      appView.innerHTML = inventoryTemplate();
      attachInventoryEvents();
      loadAndRenderInventory();
      break;
    case "billing":
  appView.innerHTML = billingTemplate();
  attachBillingEvents();
  loadAndRenderBilling();
  break;
    case "suppliers":
  appView.innerHTML = suppliersTemplate();
  attachSuppliersEvents();
  loadAndRenderSuppliers();
  break;
    case "reports":
  appView.innerHTML = reportsTemplate();
  loadAndRenderReports();
  break;
    case "dashboard":
    default:
      appView.innerHTML = dashboardTemplate();
      break;
  }
}

function showFormMessage(message, type = "success") {
  const box = document.getElementById("form-message");
  if (!box) return;

  box.style.display = "block";
  box.className = `message-box ${type === "success" ? "message-success" : "message-error"}`;
  box.textContent = message;
}

function clearFormMessage() {
  const box = document.getElementById("form-message");
  if (!box) return;
  box.style.display = "none";
  box.textContent = "";
}

function getFormData() {
  const form = document.getElementById("product-form");
  const raw = Object.fromEntries(new FormData(form));

  return {
    name: raw.name.trim(),
    category: raw.category.trim(),
    price: raw.price ? Number(raw.price) : 0,
    unit: raw.unit.trim(),
    stockQuantity: raw.stockQuantity ? Number(raw.stockQuantity) : 0,
    minStockLevel: raw.minStockLevel ? Number(raw.minStockLevel) : 0
  };
}

function fillForm(product) {
  document.getElementById("name").value = product.name ?? "";
  document.getElementById("category").value = product.category ?? "";
  document.getElementById("price").value = product.price ?? "";
  document.getElementById("unit").value = product.unit ?? "";
  document.getElementById("stockQuantity").value = product.stockQuantity ?? 0;
  document.getElementById("minStockLevel").value = product.minStockLevel ?? 0;
  document.getElementById("form-title").textContent = "Edit Product";
  document.getElementById("submit-btn").textContent = "Update Product";
  editingProductId = product.id;
  clearFormMessage();
}

function resetForm() {
  const form = document.getElementById("product-form");
  form.reset();
  editingProductId = null;
  document.getElementById("form-title").textContent = "Add Product";
  document.getElementById("submit-btn").textContent = "Save Product";
  clearFormMessage();
}

async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return await response.json();
}

async function createProduct(payload) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Failed to create product");
  return await response.json();
}

async function updateProduct(id, payload) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("Failed to update product");
  return await response.json();
}

async function deleteProduct(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) throw new Error("Failed to delete product");
}

function renderStats(products) {
  const total = products.length;
  const lowStock = products.filter(
    p => (p.stockQuantity ?? 0) <= (p.minStockLevel ?? 0)
  ).length;
  const avg =
    total > 0
      ? (products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / total).toFixed(2)
      : "0";

  const totalEl = document.getElementById("total-products");
  const lowEl = document.getElementById("low-stock-count");
  const avgEl = document.getElementById("avg-price");

  if (totalEl) totalEl.textContent = total;
  if (lowEl) lowEl.textContent = lowStock;
  if (avgEl) avgEl.textContent = `₹${avg}`;
}

function getFilteredProducts() {
  const searchInput = document.getElementById("search-products");
  const search = (searchInput?.value || "").toLowerCase().trim();

  if (!search) return productsCache;

  return productsCache.filter(product => {
    const name = (product.name || "").toLowerCase();
    const category = (product.category || "").toLowerCase();
    return name.includes(search) || category.includes(search);
  });
}

function renderProductsList(products) {
  const output = document.getElementById("products-output");
  if (!output) return;

  if (!products.length) {
    output.innerHTML = `
      <div class="empty-state">
        No products found. Add your first product using the form.
      </div>
    `;
    return;
  }

  output.innerHTML = products.map(product => {
    const stock = product.stockQuantity ?? 0;
    const min = product.minStockLevel ?? 0;
    const lowStock = stock <= min;

    return `
      <article class="product-card">
        <h4>${product.name}</h4>
        <p>${product.category || "Uncategorized"}</p>

        <div class="product-meta">
          <span>Price</span>
          <strong>₹${product.price}</strong>
        </div>

        <div class="product-meta">
          <span>Unit</span>
          <strong>${product.unit || "-"}</strong>
        </div>

        <div class="product-meta">
          <span>Stock</span>
          <strong>${stock}</strong>
        </div>

        <div class="badge-row">
          <span class="badge badge-soft">${product.category || "General"}</span>
          ${lowStock ? `<span class="badge badge-danger">Low Stock</span>` : ""}
        </div>

        <div class="card-actions">
          <button class="card-btn edit-btn" data-id="${product.id}">Edit</button>
          <button class="card-btn delete-btn" data-id="${product.id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const product = productsCache.find(p => p.id === id);
      if (product) fillForm(product);
    });
  });

  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.id);
      const confirmDelete = confirm("Are you sure you want to delete this product?");
      if (!confirmDelete) return;

      try {
        await deleteProduct(id);
        showFormMessage("Product deleted successfully.", "success");
        await loadAndRenderProducts();
        if (editingProductId === id) resetForm();
      } catch (error) {
        showFormMessage(error.message, "error");
      }
    });
  });
}

async function loadAndRenderProducts() {
  const output = document.getElementById("products-output");
  if (output) {
    output.innerHTML = `<div class="loading-state">Loading products...</div>`;
  }

  try {
    productsCache = await fetchProducts();
    renderStats(productsCache);
    renderProductsList(getFilteredProducts());
  } catch (error) {
    if (output) {
      output.innerHTML = `<div class="message-box message-error">${error.message}</div>`;
    }
  }
}

function attachProductsEvents() {
  const form = document.getElementById("product-form");
  const resetBtn = document.getElementById("reset-btn");
  const searchInput = document.getElementById("search-products");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    clearFormMessage();

    try {
      const payload = getFormData();

      if (!payload.name || payload.price < 0) {
        showFormMessage("Please enter a valid product name and price.", "error");
        return;
      }

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        showFormMessage("Product updated successfully.", "success");
      } else {
        await createProduct(payload);
        showFormMessage("Product added successfully.", "success");
      }

      resetForm();
      await loadAndRenderProducts();
    } catch (error) {
      showFormMessage(error.message, "error");
    }
  });

  resetBtn.addEventListener("click", resetForm);

  searchInput.addEventListener("input", () => {
    renderProductsList(getFilteredProducts());
  });
}

async function fetchInventorySummary() {
  const response = await fetch(`${API_BASE_URL}/inventory/summary`);
  if (!response.ok) throw new Error("Failed to fetch inventory summary");
  return await response.json();
}

async function fetchInventoryItems() {
  const response = await fetch(`${API_BASE_URL}/inventory`);
  if (!response.ok) throw new Error("Failed to fetch inventory items");
  return await response.json();
}

async function fetchLowStockItems() {
  const response = await fetch(`${API_BASE_URL}/inventory/low-stock`);
  if (!response.ok) throw new Error("Failed to fetch low stock items");
  return await response.json();
}

async function stockInProduct(id, qty) {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}/stock-in?qty=${qty}`, {
    method: "PUT"
  });

  if (!response.ok) throw new Error("Failed to stock in product");
  return await response.json();
}

async function stockOutProduct(id, qty) {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}/stock-out?qty=${qty}`, {
    method: "PUT"
  });

  if (!response.ok) throw new Error("Failed to stock out product");
  return await response.json();
}

function renderInventorySummary(summary) {
  const totalProducts = document.getElementById("inventory-total-products");
  const lowStock = document.getElementById("inventory-low-stock");
  const outOfStock = document.getElementById("inventory-out-of-stock");
  const totalValue = document.getElementById("inventory-total-value");

  if (totalProducts) totalProducts.textContent = summary.totalProducts ?? 0;
  if (lowStock) lowStock.textContent = summary.lowStockItems ?? 0;
  if (outOfStock) outOfStock.textContent = summary.outOfStockItems ?? 0;
  if (totalValue) totalValue.textContent = `₹${Number(summary.totalStockValue || 0).toFixed(2)}`;
}

function getFilteredInventory() {
  const searchInput = document.getElementById("inventory-search");
  const query = (searchInput?.value || "").toLowerCase().trim();

  if (!query) return inventoryCache;

  return inventoryCache.filter(item => {
    const name = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    return name.includes(query) || category.includes(query);
  });
}

function renderInventoryList(items) {
  const output = document.getElementById("inventory-output");
  if (!output) return;

  if (!items.length) {
    output.innerHTML = `<div class="empty-state">No inventory items found.</div>`;
    return;
  }

  output.innerHTML = items.map(item => {
    const stock = item.stockQuantity ?? 0;
    const min = item.minStockLevel ?? 0;
    const isLow = stock <= min;
    const isOut = stock === 0;

    return `
      <article class="inventory-card">
        <div class="inventory-card-head">
          <div>
            <h4>${item.name}</h4>
            <p>${item.category || "Uncategorized"}</p>
          </div>
          <div class="stock-indicator ${isOut ? "stock-out" : isLow ? "stock-low" : "stock-good"}">
            ${isOut ? "Out" : isLow ? "Low" : "Good"}
          </div>
        </div>

        <div class="inventory-meta">
          <span>Price</span>
          <strong>₹${item.price}</strong>
        </div>

        <div class="inventory-meta">
          <span>Unit</span>
          <strong>${item.unit || "-"}</strong>
        </div>

        <div class="inventory-meta">
          <span>Stock</span>
          <strong>${stock}</strong>
        </div>

        <div class="inventory-meta">
          <span>Minimum</span>
          <strong>${min}</strong>
        </div>

        <div class="inventory-actions">
          <button class="card-btn stock-in-btn" data-id="${item.id}">+ Add 5</button>
          <button class="card-btn stock-out-btn" data-id="${item.id}">- Remove 5</button>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".stock-in-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.id);
      try {
        await stockInProduct(id, 5);
        await loadAndRenderInventory();
      } catch (error) {
        alert(error.message);
      }
    });
  });

  document.querySelectorAll(".stock-out-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.id);
      try {
        await stockOutProduct(id, 5);
        await loadAndRenderInventory();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function renderLowStockList(items) {
  const output = document.getElementById("low-stock-output");
  if (!output) return;

  if (!items.length) {
    output.innerHTML = `<div class="empty-state">No low-stock alerts right now.</div>`;
    return;
  }

  output.innerHTML = items.map(item => `
    <article class="alert-card">
      <div>
        <h4>${item.name}</h4>
        <p>${item.category || "Uncategorized"}</p>
      </div>
      <div class="alert-metrics">
        <span>Stock: ${item.stockQuantity ?? 0}</span>
        <span>Min: ${item.minStockLevel ?? 0}</span>
      </div>
    </article>
  `).join("");
}

async function loadAndRenderInventory() {
  const inventoryOutput = document.getElementById("inventory-output");
  const lowStockOutput = document.getElementById("low-stock-output");

  if (inventoryOutput) {
    inventoryOutput.innerHTML = `<div class="loading-state">Loading inventory...</div>`;
  }

  if (lowStockOutput) {
    lowStockOutput.innerHTML = `<div class="loading-state">Loading alerts...</div>`;
  }

  try {
    const [summary, inventoryItems, lowStockItems] = await Promise.all([
      fetchInventorySummary(),
      fetchInventoryItems(),
      fetchLowStockItems()
    ]);

    inventoryCache = inventoryItems;
    lowStockCache = lowStockItems;

    renderInventorySummary(summary);
    renderInventoryList(getFilteredInventory());
    renderLowStockList(lowStockCache);
  } catch (error) {
    if (inventoryOutput) {
      inventoryOutput.innerHTML = `<div class="message-box message-error">${error.message}</div>`;
    }
    if (lowStockOutput) {
      lowStockOutput.innerHTML = `<div class="message-box message-error">${error.message}</div>`;
    }
  }
}

function attachInventoryEvents() {
  const searchInput = document.getElementById("inventory-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    renderInventoryList(getFilteredInventory());
  });
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("load", renderRoute);

function showBillingMessage(message, type = "success") {
  const box = document.getElementById("billing-message");
  if (!box) return;

  box.style.display = "block";
  box.className = `message-box ${type === "success" ? "message-success" : "message-error"}`;
  box.textContent = message;
}

function clearBillingMessage() {
  const box = document.getElementById("billing-message");
  if (!box) return;
  box.style.display = "none";
  box.textContent = "";
}

function clearInvoiceSuccess() {
  const box = document.getElementById("invoice-success");
  if (!box) return;
  box.style.display = "none";
  box.innerHTML = "";
}

async function fetchBillingProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error("Failed to fetch products for billing");
  return await response.json();
}

async function checkoutCart(payload) {
  const response = await fetch(`${API_BASE_URL}/billing/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Checkout failed");
  }

  return await response.json();
}

function getFilteredBillingProducts() {
  const input = document.getElementById("billing-search");
  const query = (input?.value || "").toLowerCase().trim();

  if (!query) return billingProductsCache;

  return billingProductsCache.filter(product => {
    const name = (product.name || "").toLowerCase();
    const category = (product.category || "").toLowerCase();
    return name.includes(query) || category.includes(query);
  });
}

function addToCart(productId) {
  const product = billingProductsCache.find(p => p.id === productId);
  if (!product) return;

  const existing = billingCart.find(item => item.productId === productId);

  if (existing) {
    if (existing.quantity < (product.stockQuantity ?? 0)) {
      existing.quantity += 1;
    }
  } else {
    if ((product.stockQuantity ?? 0) > 0) {
      billingCart.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price || 0),
        stockQuantity: Number(product.stockQuantity || 0),
        quantity: 1
      });
    }
  }

  renderBillingCart();
  updateBillingStats();
}

function increaseCartQty(productId) {
  const item = billingCart.find(p => p.productId === productId);
  if (!item) return;

  if (item.quantity < item.stockQuantity) {
    item.quantity += 1;
  }

  renderBillingCart();
  updateBillingStats();
}

function decreaseCartQty(productId) {
  const item = billingCart.find(p => p.productId === productId);
  if (!item) return;

  item.quantity -= 1;

  if (item.quantity <= 0) {
    billingCart = billingCart.filter(p => p.productId !== productId);
  }

  renderBillingCart();
  updateBillingStats();
}

function removeCartItem(productId) {
  billingCart = billingCart.filter(item => item.productId !== productId);
  renderBillingCart();
  updateBillingStats();
}

function renderBillingProducts(products) {
  const output = document.getElementById("billing-products-output");
  if (!output) return;

  if (!products.length) {
    output.innerHTML = `<div class="empty-state">No products available for billing.</div>`;
    return;
  }

  output.innerHTML = products.map(product => {
    const stock = Number(product.stockQuantity || 0);
    const disabled = stock <= 0;

    return `
      <article class="billing-product-card">
        <div>
          <h4>${product.name}</h4>
          <p>${product.category || "Uncategorized"}</p>
        </div>

        <div class="billing-product-meta">
          <span>₹${Number(product.price || 0).toFixed(2)}</span>
          <span>Stock: ${stock}</span>
        </div>

        <button
          class="btn ${disabled ? "btn-secondary" : "btn-primary"} add-cart-btn"
          data-id="${product.id}"
          ${disabled ? "disabled" : ""}
          type="button"
        >
          ${disabled ? "Out of Stock" : "Add to Cart"}
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".add-cart-btn").forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      addToCart(id);
    });
  });
}

function renderBillingCart() {
  const output = document.getElementById("billing-cart-output");
  if (!output) return;

  if (!billingCart.length) {
    output.innerHTML = `<div class="empty-state">Cart is empty. Add products to begin billing.</div>`;
    document.getElementById("summary-items").textContent = "0";
    document.getElementById("summary-quantity").textContent = "0";
    document.getElementById("summary-total").textContent = "₹0.00";
    return;
  }

  let totalItems = billingCart.length;
  let totalQuantity = 0;
  let totalAmount = 0;

  output.innerHTML = billingCart.map(item => {
    const lineTotal = item.price * item.quantity;
    totalQuantity += item.quantity;
    totalAmount += lineTotal;

    return `
      <article class="cart-item-card">
        <div class="cart-item-top">
          <div>
            <h4>${item.name}</h4>
            <p>₹${item.price.toFixed(2)} each</p>
          </div>
          <button class="remove-item-btn" data-id="${item.productId}" type="button">✕</button>
        </div>

        <div class="cart-item-bottom">
          <div class="qty-controls">
            <button class="qty-btn decrease-btn" data-id="${item.productId}" type="button">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn increase-btn" data-id="${item.productId}" type="button">+</button>
          </div>
          <strong>₹${lineTotal.toFixed(2)}</strong>
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("summary-items").textContent = totalItems;
  document.getElementById("summary-quantity").textContent = totalQuantity;
  document.getElementById("summary-total").textContent = `₹${totalAmount.toFixed(2)}`;

  document.querySelectorAll(".increase-btn").forEach(button => {
    button.addEventListener("click", () => increaseCartQty(Number(button.dataset.id)));
  });

  document.querySelectorAll(".decrease-btn").forEach(button => {
    button.addEventListener("click", () => decreaseCartQty(Number(button.dataset.id)));
  });

  document.querySelectorAll(".remove-item-btn").forEach(button => {
    button.addEventListener("click", () => removeCartItem(Number(button.dataset.id)));
  });
}

function updateBillingStats() {
  const itemCount = billingCart.length;
  const totalQty = billingCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = billingCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartCount = document.getElementById("billing-cart-count");
  const totalQtyEl = document.getElementById("billing-total-qty");
  const totalAmountEl = document.getElementById("billing-total-amount");

  if (cartCount) cartCount.textContent = itemCount;
  if (totalQtyEl) totalQtyEl.textContent = totalQty;
  if (totalAmountEl) totalAmountEl.textContent = `₹${totalAmount.toFixed(2)}`;
}

function renderInvoiceSuccess(invoice) {
  const box = document.getElementById("invoice-success");
  if (!box) return;

  box.style.display = "block";
  box.innerHTML = `
    <h4>Invoice Generated Successfully</h4>
    <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
    <p><strong>Customer:</strong> ${invoice.customerName}</p>
    <p><strong>Total:</strong> ₹${Number(invoice.totalAmount || 0).toFixed(2)}</p>
    <p><strong>Items:</strong> ${invoice.items?.length || 0}</p>
  `;
}

async function loadAndRenderBilling() {
  const output = document.getElementById("billing-products-output");
  if (output) {
    output.innerHTML = `<div class="loading-state">Loading products for billing...</div>`;
  }

  try {
    billingProductsCache = await fetchBillingProducts();
    renderBillingProducts(getFilteredBillingProducts());
    renderBillingCart();
    updateBillingStats();
  } catch (error) {
    if (output) {
      output.innerHTML = `<div class="message-box message-error">${error.message}</div>`;
    }
  }
}

function attachBillingEvents() {
  const searchInput = document.getElementById("billing-search");
  const clearCartBtn = document.getElementById("clear-cart-btn");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderBillingProducts(getFilteredBillingProducts());
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      billingCart = [];
      clearBillingMessage();
      clearInvoiceSuccess();
      renderBillingCart();
      updateBillingStats();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      clearBillingMessage();
      clearInvoiceSuccess();

      const customerName = document.getElementById("customer-name")?.value.trim();

      if (!customerName) {
        showBillingMessage("Customer name is required.", "error");
        return;
      }

      if (!billingCart.length) {
        showBillingMessage("Cart is empty.", "error");
        return;
      }

      const payload = {
        customerName,
        items: billingCart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      try {
        const invoice = await checkoutCart(payload);
        showBillingMessage("Checkout completed successfully.", "success");
        renderInvoiceSuccess(invoice);

        billingCart = [];
        document.getElementById("customer-name").value = "";
        renderBillingCart();
        updateBillingStats();
        await loadAndRenderBilling();
      } catch (error) {
        showBillingMessage(error.message, "error");
      }
    });
  }
}

async function fetchSuppliers() {
  const response = await fetch(`${API_BASE_URL}/suppliers`);
  if (!response.ok) throw new Error("Failed to fetch suppliers");
  return await response.json();
}

async function createSupplier(payload) {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create supplier");
  }

  return await response.json();
}

async function updateSupplier(id, payload) {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update supplier");
  }

  return await response.json();
}

async function deleteSupplier(id) {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete supplier");
  }
}

function showSupplierMessage(message, type = "success") {
  const box = document.getElementById("supplier-form-message");
  if (!box) return;

  box.style.display = "block";
  box.className = `message-box ${type === "success" ? "message-success" : "message-error"}`;
  box.textContent = message;
}

function clearSupplierMessage() {
  const box = document.getElementById("supplier-form-message");
  if (!box) return;

  box.style.display = "none";
  box.textContent = "";
}

function getSupplierFormData() {
  const form = document.getElementById("supplier-form");
  const raw = Object.fromEntries(new FormData(form));

  return {
    name: raw.name?.trim() || "",
    contactPerson: raw.contactPerson?.trim() || "",
    email: raw.email?.trim() || "",
    phone: raw.phone?.trim() || "",
    address: raw.address?.trim() || ""
  };
}

function resetSupplierForm() {
  const form = document.getElementById("supplier-form");
  if (form) form.reset();

  editingSupplierId = null;

  const formTitle = document.getElementById("supplier-form-title");
  const submitBtn = document.getElementById("supplier-submit-btn");

  if (formTitle) formTitle.textContent = "Add Supplier";
  if (submitBtn) submitBtn.textContent = "Save Supplier";

  clearSupplierMessage();
}

function fillSupplierForm(supplier) {
  document.getElementById("supplier-name").value = supplier.name || "";
  document.getElementById("supplier-contact-person").value = supplier.contactPerson || "";
  document.getElementById("supplier-email").value = supplier.email || "";
  document.getElementById("supplier-phone").value = supplier.phone || "";
  document.getElementById("supplier-address").value = supplier.address || "";

  editingSupplierId = supplier.id;

  document.getElementById("supplier-form-title").textContent = "Edit Supplier";
  document.getElementById("supplier-submit-btn").textContent = "Update Supplier";

  clearSupplierMessage();
}

function renderSuppliersStats(items) {
  const total = items.length;
  const emailCount = items.filter(item => item.email && item.email.trim() !== "").length;
  const phoneCount = items.filter(item => item.phone && item.phone.trim() !== "").length;

  const totalEl = document.getElementById("suppliers-total-count");
  const emailEl = document.getElementById("suppliers-email-count");
  const phoneEl = document.getElementById("suppliers-phone-count");

  if (totalEl) totalEl.textContent = total;
  if (emailEl) emailEl.textContent = emailCount;
  if (phoneEl) phoneEl.textContent = phoneCount;
}

function getFilteredSuppliers() {
  const searchInput = document.getElementById("supplier-search");
  const query = (searchInput?.value || "").toLowerCase().trim();

  if (!query) return suppliersCache;

  return suppliersCache.filter(item => {
    const name = (item.name || "").toLowerCase();
    const contactPerson = (item.contactPerson || "").toLowerCase();
    const email = (item.email || "").toLowerCase();
    return name.includes(query) || contactPerson.includes(query) || email.includes(query);
  });
}

function renderSuppliersList(items) {
  const output = document.getElementById("suppliers-output");
  if (!output) return;

  if (!items.length) {
    output.innerHTML = `<div class="empty-state">No suppliers found. Add your first supplier.</div>`;
    return;
  }

  output.innerHTML = items.map(item => `
    <article class="supplier-card">
      <div class="supplier-card-head">
        <div>
          <h4>${item.name}</h4>
          <p>${item.contactPerson || "No contact person"}</p>
        </div>
        <span class="badge badge-soft">Supplier</span>
      </div>

      <div class="supplier-meta">
        <span>Email</span>
        <strong>${item.email || "-"}</strong>
      </div>

      <div class="supplier-meta">
        <span>Phone</span>
        <strong>${item.phone || "-"}</strong>
      </div>

      <div class="supplier-meta">
        <span>Address</span>
        <strong>${item.address || "-"}</strong>
      </div>

      <div class="card-actions">
        <button class="card-btn supplier-edit-btn" data-id="${item.id}" type="button">Edit</button>
        <button class="card-btn supplier-delete-btn" data-id="${item.id}" type="button">Delete</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".supplier-edit-btn").forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const supplier = suppliersCache.find(item => item.id === id);
      if (supplier) fillSupplierForm(supplier);
    });
  });

  document.querySelectorAll(".supplier-delete-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.id);
      const confirmed = confirm("Are you sure you want to delete this supplier?");
      if (!confirmed) return;

      try {
        await deleteSupplier(id);
        showSupplierMessage("Supplier deleted successfully.", "success");
        if (editingSupplierId === id) resetSupplierForm();
        await loadAndRenderSuppliers();
      } catch (error) {
        showSupplierMessage(error.message, "error");
      }
    });
  });
}

async function loadAndRenderSuppliers() {
  const output = document.getElementById("suppliers-output");
  if (output) {
    output.innerHTML = `<div class="loading-state">Loading suppliers...</div>`;
  }

  try {
    suppliersCache = await fetchSuppliers();
    renderSuppliersStats(suppliersCache);
    renderSuppliersList(getFilteredSuppliers());
  } catch (error) {
    if (output) {
      output.innerHTML = `<div class="message-box message-error">${error.message}</div>`;
    }
  }
}

function attachSuppliersEvents() {
  const form = document.getElementById("supplier-form");
  const resetBtn = document.getElementById("supplier-reset-btn");
  const searchInput = document.getElementById("supplier-search");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearSupplierMessage();

      const payload = getSupplierFormData();

      if (!payload.name) {
        showSupplierMessage("Supplier name is required.", "error");
        return;
      }

      try {
        if (editingSupplierId) {
          await updateSupplier(editingSupplierId, payload);
          showSupplierMessage("Supplier updated successfully.", "success");
        } else {
          await createSupplier(payload);
          showSupplierMessage("Supplier added successfully.", "success");
        }

        resetSupplierForm();
        await loadAndRenderSuppliers();
      } catch (error) {
        showSupplierMessage(error.message, "error");
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetSupplierForm);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderSuppliersList(getFilteredSuppliers());
    });
  }
}

async function fetchReportsSummary() {
  const response = await fetch(`${API_BASE_URL}/reports/summary`);
  if (!response.ok) throw new Error("Failed to fetch reports summary");
  return await response.json();
}

async function fetchTopProductsReport() {
  const response = await fetch(`${API_BASE_URL}/reports/top-products`);
  if (!response.ok) throw new Error("Failed to fetch top products report");
  return await response.json();
}

async function fetchDailySalesReport() {
  const response = await fetch(`${API_BASE_URL}/reports/daily-sales`);
  if (!response.ok) throw new Error("Failed to fetch daily sales report");
  return await response.json();
}

function destroyReportsCharts() {
  if (topProductsChartInstance) {
    topProductsChartInstance.destroy();
    topProductsChartInstance = null;
  }

  if (dailySalesChartInstance) {
    dailySalesChartInstance.destroy();
    dailySalesChartInstance = null;
  }
}

function renderTopProductsChart(items) {
  const canvas = document.getElementById("top-products-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = items.map(item => item.productName);
  const quantities = items.map(item => Number(item.totalQuantitySold || 0));
  const revenues = items.map(item => Number(item.totalRevenue || 0));

  topProductsChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Quantity Sold",
          data: quantities,
          backgroundColor: "rgba(13, 108, 103, 0.72)",
          borderRadius: 12
        },
        {
          label: "Revenue",
          data: revenues,
          backgroundColor: "rgba(196, 164, 114, 0.62)",
          borderRadius: 12
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#4b463f"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#6f6a61" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#6f6a61" },
          grid: { color: "rgba(31, 29, 26, 0.08)" }
        }
      }
    }
  });
}

function destroyReportsCharts() {
  if (topProductsChartInstance) {
    topProductsChartInstance.destroy();
    topProductsChartInstance = null;
  }

  if (dailySalesChartInstance) {
    dailySalesChartInstance.destroy();
    dailySalesChartInstance = null;
  }
}

function renderTopProductsChart(items) {
  const canvas = document.getElementById("top-products-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = items.map(item => item.productName);
  const quantities = items.map(item => Number(item.totalQuantitySold || 0));
  const revenues = items.map(item => Number(item.totalRevenue || 0));

  topProductsChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Quantity Sold",
          data: quantities,
          backgroundColor: "rgba(13, 108, 103, 0.72)",
          borderRadius: 12
        },
        {
          label: "Revenue",
          data: revenues,
          backgroundColor: "rgba(196, 164, 114, 0.62)",
          borderRadius: 12
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#4b463f"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#6f6a61" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#6f6a61" },
          grid: { color: "rgba(31, 29, 26, 0.08)" }
        }
      }
    }
  });
}

function renderDailySalesChart(items) {
  const canvas = document.getElementById("daily-sales-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const labels = items.map(item => item.saleDate).reverse();
  const revenues = items.map(item => Number(item.totalRevenue || 0)).reverse();
  const invoices = items.map(item => Number(item.totalInvoices || 0)).reverse();

  dailySalesChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenues,
          borderColor: "#0d6c67",
          backgroundColor: "rgba(13, 108, 103, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 4
        },
        {
          label: "Invoices",
          data: invoices,
          borderColor: "#c49a4d",
          backgroundColor: "rgba(196, 154, 77, 0.12)",
          fill: false,
          tension: 0.35,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#4b463f"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#6f6a61" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#6f6a61" },
          grid: { color: "rgba(31, 29, 26, 0.08)" }
        }
      }
    }
  });
}

function renderTopProductsTable(items) {
  const output = document.getElementById("top-products-table");
  if (!output) return;

  if (!items.length) {
    output.innerHTML = `<div class="empty-state">No top products data available.</div>`;
    return;
  }

  output.innerHTML = items.map(item => `
    <article class="report-item">
      <div>
        <h4>${item.productName}</h4>
        <p>Quantity Sold: ${item.totalQuantitySold}</p>
      </div>
      <strong>₹${Number(item.totalRevenue || 0).toFixed(2)}</strong>
    </article>
  `).join("");
}

async function loadAndRenderReports() {
  const topProductsTable = document.getElementById("top-products-table");
  const dailySalesTable = document.getElementById("daily-sales-table");

  if (topProductsTable) {
    topProductsTable.innerHTML = `<div class="loading-state">Loading top products...</div>`;
  }

  if (dailySalesTable) {
    dailySalesTable.innerHTML = `<div class="loading-state">Loading daily sales...</div>`;
  }

  try {
    const [summary, topProducts, dailySales] = await Promise.all([
      fetchReportsSummary(),
      fetchTopProductsReport(),
      fetchDailySalesReport()
    ]);

    reportsSummaryCache = summary;
    reportsTopProductsCache = topProducts;
    reportsDailySalesCache = dailySales;

    renderReportsSummary(summary);
    renderTopProductsTable(topProducts);
    renderDailySalesTable(dailySales);

    destroyReportsCharts();
    renderTopProductsChart(topProducts);
    renderDailySalesChart(dailySales);
  } catch (error) {
    if (topProductsTable) {
      topProductsTable.innerHTML = `<div class="message-box message-error">${error.message}</div>`;
    }
    if (dailySalesTable) {
      dailySalesTable.innerHTML = `<div class="message-box message-error">${error.message}</div>`;
    }
  }
}