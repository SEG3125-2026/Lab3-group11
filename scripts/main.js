/* =========================
   Navigation (Breadcrumbs)
   - each breadcrumb button has data-tab="Client|Products|Cart"
   ========================= */

function showTab(tabName) {
  const sections = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < sections.length; i++) sections[i].style.display = "none";

  const target = document.getElementById(tabName);
  if (target) target.style.display = "block";

  // Update breadcrumb active state
  const crumbs = document.querySelectorAll(".breadcrumbs .crumb");
  crumbs.forEach((c) => {
    const isActive = c.getAttribute("data-tab") === tabName;
    c.classList.toggle("active", isActive);
    c.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

/* =========================
   Preferences (Client page)
   ========================= */
function getUserPreferences() {
  const vegetarian = document.getElementById("prefVegetarian")?.checked || false;
  const glutenFree = document.getElementById("prefGlutenFree")?.checked || false;
  const lactoseFree = document.getElementById("prefLactoseFree")?.checked || false;
  const vegan = document.getElementById("prefVegan")?.checked || false;

  const organicChoice =
    document.querySelector('input[name="prefOrganic"]:checked')?.value || "Any";

  const category =
    document.getElementById("categoryFilter")?.value || "All";

  return { vegetarian, glutenFree, lactoseFree, vegan, organicChoice, category };
}

function showPrefsSummary(prefs) {
  const summary = document.getElementById("prefsSummary");
  if (!summary) return;

  const parts = [];
  if (prefs.vegetarian) parts.push("Vegetarian");
  if (prefs.glutenFree) parts.push("Gluten-free");
  if (prefs.lactoseFree) parts.push("Lactose-free");
  if (prefs.vegan) parts.push("Vegan");
  if (prefs.organicChoice !== "Any") parts.push(`Preference: ${prefs.organicChoice}`);

  summary.textContent =
    parts.length > 0 ? `Saved: ${parts.join(" • ")}` : "Saved: No restrictions / no preference";
}

/* =========================
   Products (filtered list + sorting + categories)
   Requires groceries.js:
     restrictListProducts(products, prefs, sortOrder) -> array of product objects
   ========================= */
function populateProductsFromPrefs(prefs, divId) {
  const container = document.getElementById(divId);
  if (!container) return;

  container.innerHTML = "";

  const sortOrder = document.getElementById("sortPrice")?.value || "asc";
  const filtered = restrictListProducts(products, prefs, sortOrder);

  if (!filtered || filtered.length === 0) {
    container.innerHTML = "<p><em>No products match your preferences.</em></p>";
    return;
  }

  // Create cards
  filtered.forEach((prodObj) => {
    const card = document.createElement("label");
    card.className = "product-card";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "product";
    checkbox.value = prodObj.name;

    const badge = document.createElement("div");
    badge.className = "category-badge";
    badge.textContent = prodObj.category;

    const img = document.createElement("img");
    img.className = "product-img";
    img.src = prodObj.img || "images/placeholder.jpg";
    img.alt = prodObj.name;

    const info = document.createElement("div");
    info.className = "product-info";

    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = prodObj.name;

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = `$${prodObj.price.toFixed(2)}`;

    info.appendChild(name);
    info.appendChild(price);

    card.appendChild(checkbox);
    card.appendChild(badge);
    card.appendChild(img);
    card.appendChild(info);

    container.appendChild(card);
  });
}

/* =========================
   Cart (existing logic + total to 2 decimals)
   ========================= */
function selectedItems() {
  const ele = document.getElementsByName("product");
  const chosenProducts = [];

  for (let i = 0; i < ele.length; i++) {
    if (ele[i].checked) chosenProducts.push(ele[i].value);
  }

  const cartDiv = document.getElementById("displayCart");
  cartDiv.innerHTML = "";

  if (chosenProducts.length === 0) {
    cartDiv.innerHTML = "<p><em>Your cart is currently empty.</em></p>";
    return;
  }

  const title = document.createElement("p");
  title.innerHTML = "<b>You selected:</b>";
  cartDiv.appendChild(title);

  const list = document.createElement("div");
  list.className = "cart-list";

  chosenProducts.forEach((name) => {
    const prod = products.find((p) => p.name === name);
    const item = document.createElement("div");
    item.className = "cart-item-simple";
    item.textContent = `${name} - $${prod ? prod.price.toFixed(2) : "0.00"}`;
    list.appendChild(item);
  });

  cartDiv.appendChild(list);

  const total = getTotalPrice(chosenProducts);
  const totalBox = document.createElement("div");
  totalBox.className = "cart-total-box";
  totalBox.textContent = `Total Price: $${total.toFixed(2)}`;
  cartDiv.appendChild(totalBox);

  showTab("Cart");
}

/* =========================
   Clear cart / restart
   ========================= */
function clearCartAndRestart() {
  // Clear cart display
  const cartDiv = document.getElementById("displayCart");
  if (cartDiv) cartDiv.innerHTML = "";

  // Uncheck all product checkboxes
  const productChecks = document.getElementsByName("product");
  for (let i = 0; i < productChecks.length; i++) productChecks[i].checked = false;

  // Reset client preferences
  const veg = document.getElementById("prefVegetarian");
  const gf = document.getElementById("prefGlutenFree");
  const lf = document.getElementById("prefLactoseFree");
  const vg = document.getElementById("prefVegan");
  if (veg) veg.checked = false;
  if (gf) gf.checked = false;
  if (lf) lf.checked = false;
  if (vg) vg.checked = false;

  const anyRadio = document.querySelector('input[name="prefOrganic"][value="Any"]');
  if (anyRadio) anyRadio.checked = true;

  const summary = document.getElementById("prefsSummary");
  if (summary) summary.textContent = "";

  // Reset category and sort
  const cat = document.getElementById("categoryFilter");
  if (cat) cat.value = "All";

  const sort = document.getElementById("sortPrice");
  if (sort) sort.value = "asc";

  // Clear products list
  const prodDiv = document.getElementById("displayProduct");
  if (prodDiv) prodDiv.innerHTML = "";

  showTab("Client");
}

let lastPrefs = null;

document.addEventListener("DOMContentLoaded", () => {
  // Breadcrumb click handlers
  document.querySelectorAll(".navlink").forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.getAttribute("data-tab")));
  });

  // Default open Client
  showTab("Client");

  // Visual Accessibility (font size)
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  if (fontSizeSelect) {
    document.body.style.fontSize = fontSizeSelect.value + "px";
    fontSizeSelect.addEventListener("change", () => {
      document.body.style.fontSize = fontSizeSelect.value + "px";
    });
  }

  // Apply preferences button
  const applyBtn = document.getElementById("applyPrefsBtn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      lastPrefs = getUserPreferences();
      showPrefsSummary(lastPrefs);
      populateProductsFromPrefs(lastPrefs, "displayProduct");
      showTab("Products");
    });
  }

  // Category / sort change: re-render list
  const sort = document.getElementById("sortPrice");
  const cat = document.getElementById("categoryFilter");
  const rerender = () => {
    if (!lastPrefs) lastPrefs = getUserPreferences(); // allow filtering even before Apply
    else {
      // keep dietary + organic from lastPrefs, update category only
      lastPrefs = { ...lastPrefs, category: getUserPreferences().category };
    }
    populateProductsFromPrefs(lastPrefs, "displayProduct");
  };

  if (sort) sort.addEventListener("change", rerender);
  if (cat) cat.addEventListener("change", rerender);

  // Clear cart / restart
  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearCartAndRestart);
});
