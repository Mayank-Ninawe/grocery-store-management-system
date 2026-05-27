const originalFetch = window.fetch;

let demoProducts = [
  { id: 1, name: "Premium Coffee Beans", category: "Beverages", price: 850, unit: "500g", stockQuantity: 45, minStockLevel: 10 },
  { id: 2, name: "Organic Green Tea", category: "Beverages", price: 450, unit: "250g", stockQuantity: 12, minStockLevel: 15 },
  { id: 3, name: "Whole Wheat Bread", category: "Bakery", price: 60, unit: "1 loaf", stockQuantity: 8, minStockLevel: 20 },
  { id: 4, name: "Almond Milk", category: "Dairy Alternatives", price: 300, unit: "1L", stockQuantity: 30, minStockLevel: 10 },
  { id: 5, name: "Extra Virgin Olive Oil", category: "Pantry", price: 1200, unit: "1L", stockQuantity: 5, minStockLevel: 10 },
  { id: 6, name: "Avocado", category: "Produce", price: 150, unit: "1 pc", stockQuantity: 0, minStockLevel: 10 },
];

let demoSuppliers = [
  { id: 1, name: "Global Beverages Inc.", contactPerson: "John Doe", email: "john@globalbev.com", phone: "9876543210", address: "Mumbai, MH" },
  { id: 2, name: "Fresh Farms", contactPerson: "Jane Smith", email: "jane@freshfarms.in", phone: "9876543211", address: "Pune, MH" },
];

let nextProductId = 7;
let nextSupplierId = 3;

window.fetch = async function(...args) {
  const url = typeof args[0] === 'string' ? args[0] : args[0].url;
  const options = args[1] || {};
  const method = (options.method || "GET").toUpperCase();

  // Try hitting the real backend first
  try {
    const response = await originalFetch(...args);
    if (response.ok) return response;
  } catch (error) {
    console.warn("Backend fetch failed. Falling back to mock data for:", url);
  }

  // FALLBACK LOGIC (Demo Data)
  const createJSONResponse = (data) => new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

  if (url.includes('/api/products')) {
    if (method === "GET") return createJSONResponse(demoProducts);
    if (method === "POST") {
      const body = JSON.parse(options.body);
      const newProduct = { ...body, id: nextProductId++ };
      demoProducts.push(newProduct);
      return createJSONResponse(newProduct);
    }
    const match = url.match(/\/api\/products\/(\d+)/);
    if (match) {
      const id = Number(match[1]);
      if (method === "PUT") {
        const body = JSON.parse(options.body);
        const idx = demoProducts.findIndex(p => p.id === id);
        if (idx !== -1) {
          demoProducts[idx] = { ...demoProducts[idx], ...body };
          return createJSONResponse(demoProducts[idx]);
        }
      }
      if (method === "DELETE") {
        demoProducts = demoProducts.filter(p => p.id !== id);
        return createJSONResponse({ success: true });
      }
    }
  }

  if (url.includes('/api/inventory/summary')) {
    const totalProducts = demoProducts.length;
    const lowStockItems = demoProducts.filter(p => (p.stockQuantity||0) <= (p.minStockLevel||0)).length;
    const outOfStockItems = demoProducts.filter(p => (p.stockQuantity||0) === 0).length;
    const totalStockValue = demoProducts.reduce((sum, p) => sum + (p.price * (p.stockQuantity||0)), 0);
    return createJSONResponse({ totalProducts, lowStockItems, outOfStockItems, totalStockValue });
  }

  if (url.includes('/api/inventory/low-stock')) {
    return createJSONResponse(demoProducts.filter(p => (p.stockQuantity||0) <= (p.minStockLevel||0)));
  }

  if (url.includes('/api/inventory') && method === "GET") {
    return createJSONResponse(demoProducts);
  }

  const stockMatch = url.match(/\/api\/inventory\/(\d+)\/stock-(in|out)\?qty=(\d+)/);
  if (stockMatch && method === "PUT") {
    const id = Number(stockMatch[1]);
    const op = stockMatch[2];
    const qty = Number(stockMatch[3]);
    const idx = demoProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      if (op === "in") demoProducts[idx].stockQuantity += qty;
      else demoProducts[idx].stockQuantity = Math.max(0, demoProducts[idx].stockQuantity - qty);
      return createJSONResponse(demoProducts[idx]);
    }
  }

  if (url.includes('/api/billing/checkout') && method === "POST") {
    const body = JSON.parse(options.body);
    let totalAmount = 0;
    body.items.forEach(item => {
      const product = demoProducts.find(p => p.id === item.productId);
      if (product) {
        totalAmount += product.price * item.quantity;
        product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      }
    });
    return createJSONResponse({
      invoiceNumber: "INV-" + Math.floor(Math.random() * 100000),
      customerName: body.customerName,
      totalAmount: totalAmount,
      items: body.items
    });
  }

  if (url.includes('/api/suppliers')) {
    if (method === "GET") return createJSONResponse(demoSuppliers);
    if (method === "POST") {
      const body = JSON.parse(options.body);
      const newSupplier = { ...body, id: nextSupplierId++ };
      demoSuppliers.push(newSupplier);
      return createJSONResponse(newSupplier);
    }
    const match = url.match(/\/api\/suppliers\/(\d+)/);
    if (match) {
      const id = Number(match[1]);
      if (method === "PUT") {
        const body = JSON.parse(options.body);
        const idx = demoSuppliers.findIndex(p => p.id === id);
        if (idx !== -1) {
          demoSuppliers[idx] = { ...demoSuppliers[idx], ...body };
          return createJSONResponse(demoSuppliers[idx]);
        }
      }
      if (method === "DELETE") {
        demoSuppliers = demoSuppliers.filter(p => p.id !== id);
        return createJSONResponse({ success: true });
      }
    }
  }

  if (url.includes('/api/reports/summary')) {
    return createJSONResponse({
      totalRevenue: 145000.50,
      totalInvoices: 120,
      lowStockItems: demoProducts.filter(p => (p.stockQuantity||0) <= (p.minStockLevel||0)).length,
      outOfStockItems: demoProducts.filter(p => (p.stockQuantity||0) === 0).length
    });
  }

  if (url.includes('/api/reports/top-products')) {
    return createJSONResponse([
      { productId: 1, productName: "Premium Coffee Beans", quantitySold: 120, revenue: 102000 },
      { productId: 4, productName: "Almond Milk", quantitySold: 90, revenue: 27000 },
      { productId: 2, productName: "Organic Green Tea", quantitySold: 60, revenue: 27000 },
    ]);
  }

  if (url.includes('/api/reports/daily-sales')) {
    return createJSONResponse([
      { date: "2026-05-20", invoicesCount: 15, revenue: 5200 },
      { date: "2026-05-21", invoicesCount: 18, revenue: 6100 },
      { date: "2026-05-22", invoicesCount: 12, revenue: 4500 },
      { date: "2026-05-23", invoicesCount: 22, revenue: 8900 },
      { date: "2026-05-24", invoicesCount: 25, revenue: 9500 },
      { date: "2026-05-25", invoicesCount: 20, revenue: 7800 },
      { date: "2026-05-26", invoicesCount: 19, revenue: 6900 },
    ]);
  }

  // If nothing matched in fallback, just throw an error or return original
  return originalFetch(...args);
};
