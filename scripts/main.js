/* =========================
   Tabs (works with onclick="openInfo(this, 'TabName')")
   ========================= */
function openInfo(btn, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";

  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  btn.className += " active";
}

/* =========================
   Preferences (Client tab)
   ========================= */
function getUserPreferences() {
  const vegetarian = document.getElementById("prefVegetarian")?.checked || false;
  const glutenFree = document.getElementById("prefGlutenFree")?.checked || false;
  const lactoseFree = document.getElementById("prefLactoseFree")?.checked || false;
  const vegan = document.getElementById("prefVegan")?.checked || false;

  const organicChoice =
    document.querySelector('input[name="prefOrganic"]:checked')?.value || "Any";

  return { vegetarian, glutenFree, lactoseFree, vegan, organicChoice };
}

function showPrefsSummary(prefs) {
  const summary = document.getElementById("prefsSummary");
  if (!summary) return;

  const parts = [];
  if (prefs.vegetarian) parts.push("Vegetarian");
  if (prefs.glutenFree) parts.push("Gluten-free");
  if (prefs.lactoseFree) parts.push("Lactose-free");
  if (prefs.vegan) parts.push("Vegan");
  if (prefs.organicChoice !== "Any")
    parts.push(`Preference: ${prefs.organicChoice}`);

  summary.textContent =
    parts.length > 0
      ? `Saved: ${parts.join(" • ")}`
      : "Saved: No restrictions / no preference";
}

/* =========================
   Products (filtered list + sorting)
   Requires groceries.js:
     restrictListProducts(products, prefs, sortOrder)
   ========================= */
function populateProductsFromPrefs(prefs, divId) {
  const s2 = document.getElementById(divId);
  if (!s2) return;

  s2.innerHTML = "";

  const sortOrder = document.getElementById("sortPrice")?.value || "asc";

  // restrictListProducts returns an array of product names (already filtered + sorted)
  const optionArray = restrictListProducts(products, prefs, sortOrder);

  if (!optionArray || optionArray.length === 0) {
    s2.textContent = "No products match your preferences.";
    return;
  }
  
  for (let i = 0; i < optionArray.length; i++) {
  const productName = optionArray[i];
  const prodObj = products.find((p) => p.name === productName);

  const card = document.createElement("label");
  card.className = "product-card";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = "product";
  checkbox.value = productName;

  const img = document.createElement("img");
  img.className = "product-img";
  img.src = prodObj?.img || "images/placeholder.jpg";
  img.alt = productName;

  const info = document.createElement("div");
  info.className = "product-info";

  const name = document.createElement("div");
  name.className = "product-name";
  name.textContent = productName;

  const price = document.createElement("div");
  price.className = "product-price";
  price.textContent = prodObj ? `$${prodObj.price.toFixed(2)}` : "";

  info.appendChild(name);
  info.appendChild(price);

  card.appendChild(checkbox);
  card.appendChild(img);
  card.appendChild(info);

  s2.appendChild(card);
}

}

/* =========================
   Cart (existing logic + total to 2 decimals)
   ========================= */
function selectedItems() {
  const ele =document.getElementsByName("product");
  const chosenProducts = [];

  for(let i = 0; i < ele.length; i++) {
    if (ele[i].checked) chosenProducts.push(ele[i].value);
  }

  const cartDiv = document.getElementById("displayCart");
  cartDiv.innerHTML = "";

  if(chosenProducts.length === 0) {
    cartDiv.innerHTML = "<p><em>Your cart is currently empty.</em></p>";
    return;
  }

  const title= document.createElement("p");
  title.innerHTML= "<b>You selected:</b>";
  cartDiv.appendChild(title);

  const list = document.createElement("div");
  list.className = "cart-list";

  chosenProducts.forEach((name) => {
     const item = document.createElement ("div");
    item.className = "cart-item-simple";
    item.textContent = name + ` - $${products.find(p => p.name === name).price.toFixed(2)}`;
    list.appendChild(item); 
  });

  cartDiv.appendChild(list);
  
//for the total price at the end of the cart
  const total = getTotalPrice(chosenProducts);
  const totalBox = document.createElement("div");
  totalBox.className = "cart-total-box";
  totalBox.textContent = `Total Price: $${total.toFixed(2)}`;

  cartDiv.appendChild(totalBox);
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
  for (let i = 0; i < productChecks.length; i++) {
    productChecks[i].checked = false;
  }

  // Reset client preferences
  const veg = document.getElementById("prefVegetarian");
  const gf = document.getElementById("prefGlutenFree");
  if (veg) veg.checked = false;
  if (gf) gf.checked = false;

  const anyRadio = document.querySelector(
    'input[name="prefOrganic"][value="Any"]'
  );
  if (anyRadio) anyRadio.checked = true;

  const summary = document.getElementById("prefsSummary");
  if (summary) summary.textContent = "";

  // Clear products list
  const prodDiv = document.getElementById("displayProduct");
  if (prodDiv) prodDiv.innerHTML = "";

  // Reset sort dropdown (if present)
  const sort = document.getElementById("sortPrice");
  if (sort) sort.value = "asc";

  // Go back to Client tab
  const clientBtn = document.querySelectorAll(".tablinks")[0];
  if (clientBtn) openInfo(clientBtn, "Client");
}


let lastPrefs = null;

document.addEventListener("DOMContentLoaded", () => {
  // Default open Client tab
  const firstTab = document.querySelector(".tablinks");
  if (firstTab) firstTab.click();

  // Apply Visual Accessibilty 
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  if (fontSizeSelect) {
    document.body.style.fontSize = fontSizeSelect.value + "px";
    fontSizeSelect.addEventListener("change", () => {
      document.body.style.fontSize = fontSizeSelect.value +"px";
    });
  }

  // Apply preferences button
  const btn = document.getElementById("applyPrefsBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      lastPrefs = getUserPreferences();
      showPrefsSummary(lastPrefs);
      populateProductsFromPrefs(lastPrefs, "displayProduct");

      // Switch to Products tab
      const productsBtn = document.querySelectorAll(".tablinks")[1];
      if (productsBtn) openInfo(productsBtn, "Products");
    });
  }

  // Sort dropdown: re-render current filtered list when changed
  const sort = document.getElementById("sortPrice");
  if (sort) {
    sort.addEventListener("change", () => {
      if (!lastPrefs) return; // user hasn't applied preferences yet
      populateProductsFromPrefs(lastPrefs, "displayProduct");
    });
  }

  // Clear cart / restart button
  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearCartAndRestart);
  }
});
