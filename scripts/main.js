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

    const qtyWrap =document.createElement("div");
    qtyWrap.className ="qty-control";

    const minusBtn =document.createElement("button");
    minusBtn.type ="button";
    minusBtn.className = "qty-btn";
    minusBtn.textContent ="−";

    const qtyInput = document.createElement("input");
    qtyInput.type ="number";
    qtyInput.className = "qty-input";
    qtyInput.min = "0";
    qtyInput.max = "99";
    qtyInput.value = "0";
    qtyInput.setAttribute("data-name", prodObj.name);

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className ="qty-btn";
    plusBtn.textContent ="+";

    const clampQty= (n) => Math.max(0, Math.min(99, n));

    minusBtn.addEventListener("click", () =>{
      const next =clampQty((parseInt(qtyInput.value, 10) || 0)- 1);
      qtyInput.value =next;
    });

    plusBtn.addEventListener("click", ()=> {
      const next = clampQty((parseInt(qtyInput.value, 10) || 0) + 1);
      qtyInput.value = next;
    });

    qtyInput.addEventListener("change", () => {
      qtyInput.value =clampQty(parseInt(qtyInput.value, 10) || 0);
    });

    qtyWrap.appendChild(minusBtn);
    qtyWrap.appendChild(qtyInput);
    qtyWrap.appendChild(plusBtn);


    const badge = document.createElement("div");
    badge.className = "category-badge";
    badge.textContent = prodObj.category;

    const img= document.createElement("img");
    img.className = "product-img";
    img.src =prodObj.img || "images/placeholder.jpg";
    img.alt = prodObj.name;

    const info= document.createElement("div");
    info.className ="product-info";

    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = prodObj.name;

    const price =document.createElement("div");
    price.className ="product-price";
    price.textContent= `$${prodObj.price.toFixed(2)}`;

    info.appendChild(name);
    info.appendChild(price);

    card.appendChild(badge);
    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(qtyWrap);

    container.appendChild(card);
  });
}


/* =========================
   Cart (existing logic + total to 2 decimals)
   ========================= */
function selectedItems() {

  const qtyInputs = document.querySelectorAll("#displayProduct .qty-input");
  const cartItems = []; 

  qtyInputs.forEach((inp) => {
    const name = inp.getAttribute("data-name");
    const qty = Math.max(0, Math.min(99, parseInt(inp.value, 10) || 0));
    if (name && qty > 0) cartItems.push({ name, qty });
  });

  const cartDiv = document.getElementById("displayCart");
  cartDiv.innerHTML = "";

  if (cartItems.length=== 0) {
    cartDiv.innerHTML = "<p><em>Your cart is currently empty.</em></p>";
    return;
  }

  const title =document.createElement("p");
  title.innerHTML = "<b>You selected:</b>";
  cartDiv.appendChild(title);

  const list = document.createElement("div");
  list.className = "cart-list";

  cartItems.forEach(({ name, qty }) => {
    const prod = products.find((p) => p.name === name);

    const item =document.createElement("div");
    item.className = "cart-item";

    const img = document.createElement("img");
    img.className = "cart-img";
    img.src = prod?.img || "images/placeholder.jpg";
    img.alt = name;

    const info = document.createElement("div");
    info.className ="cart-info";

    const title =document.createElement("div");
    title.className = "cart-name";
    title.textContent= name;


    const qtyRow = document.createElement("div");
    qtyRow.className = "cart-qty-row";

    const qtyWrap =document.createElement("div");
    qtyWrap.className = "qty-control small";

    const minusBtn =document.createElement("button");
    minusBtn.type ="button";
    minusBtn.className = "qty-btn";
    minusBtn.textContent = "−";

    const qtyInput =document.createElement("input");
    qtyInput.type = "number";
    qtyInput.className = "qty-input small";
    qtyInput.min = "0";
    qtyInput.max ="99";
    qtyInput.value =String(qty);
    qtyInput.setAttribute("data-name", name);

    const plusBtn =document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "qty-btn";
    plusBtn.textContent = "+";

    const subtotal = document.createElement("div");
    subtotal.className = "cart-subtotal";
    const unitPrice = prod ? prod.price : 0;
    subtotal.textContent =`$${(unitPrice * qty).toFixed(2)}`;

    const clampQty = (n) => Math.max(0, Math.min(99, n));

    const syncProductPageQty =(newQty) => {
      const productInput = document.querySelector(`.qty-input[data-name="${CSS.escape(name)}"]`);
      if (productInput) productInput.value = String(newQty);
    };

    const updateSubtotal =() => {
      const newQty =clampQty(parseInt(qtyInput.value, 10) || 0);
      qtyInput.value = String(newQty);
      subtotal.textContent =`$${(unitPrice * newQty).toFixed(2)}`;
      syncProductPageQty(newQty);
    };

    minusBtn.addEventListener("click", () => {
      qtyInput.value =String(clampQty((parseInt(qtyInput.value, 10) || 0)- 1));
      updateSubtotal();
      selectedItems();
    });

    plusBtn.addEventListener("click", () => {
      qtyInput.value = String(clampQty((parseInt(qtyInput.value, 10) || 0)+ 1));
      updateSubtotal();
      selectedItems(); 
    });

    qtyInput.addEventListener("change", () => {
      updateSubtotal();
      selectedItems(); 
    });

    qtyWrap.appendChild(minusBtn);
    qtyWrap.appendChild(qtyInput);
    qtyWrap.appendChild(plusBtn);

    qtyRow.appendChild(qtyWrap);
    qtyRow.appendChild(subtotal);


    info.appendChild(title);
    info.appendChild(qtyRow);

    item.appendChild(img);
    item.appendChild(info);

    list.appendChild(item);
  });

  cartDiv.appendChild(list);

  const total =getTotalPriceWithQuantities(cartItems);
  const totalBox =document.createElement("div");
  totalBox.className = "cart-total-box";
  totalBox.textContent= `Total Price: $${total.toFixed(2)}`;
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
  const qtyInputs = document.querySelectorAll(".qty-input");
  qtyInputs.forEach((inp) => (inp.value = "0"));

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
  
  // Reset Font Size
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  if (fontSizeSelect){
    fontSizeSelect.value = "16";
    document.body.style.fontSize = "16px";
  }
  
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
