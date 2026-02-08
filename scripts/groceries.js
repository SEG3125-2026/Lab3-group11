/* groceries.js
   Product data + filtering/sorting helpers (with categories)
*/

// Product list (keep your images folder paths)
var products = [
  // Vegetables
  { name: "Brocoli", category: "Vegetables", vegetarian: true,  glutenFree: true,  organic: true,  vegan: true,  lactoseFree: true,  price: 1.99, img: "images/brocoli.png" },
  { name: "Green Peas", category: "Vegetables", vegetarian: true, glutenFree: true, organic: true, vegan: true, lactoseFree: true, price: 3.99, img:"images/peas.png" },

  // Fruits
  { name: "Apples", category: "Fruits", vegetarian: true,  glutenFree: true,  organic: true,  vegan: true,  lactoseFree: true,  price: 3.99, img:"images/apples.png" },

  // Dairy
  { name: "Milk", category: "Dairy", vegetarian: true,  glutenFree: true,  organic: false, vegan: false, lactoseFree: false, price: 2.79, img:"images/milk.png" },
  { name: "Lactose-free Milk", category: "Dairy", vegetarian: true, glutenFree: true, organic: false, vegan: false, lactoseFree: true, price: 6.79, img:"images/lactoseFreeMilk.png" },

  // Meats
  { name: "Chicken Breast", category: "Meats", vegetarian: false, glutenFree: true, organic: true, vegan: false, lactoseFree: true, price: 7.99, img:"images/chicken.png" },
  { name: "Ground beef", category: "Meats", vegetarian: false, glutenFree: true, organic: false, vegan: false, lactoseFree: true, price: 8.49, img:"images/beef.png" },
  { name: "Salmon", category: "Meats", vegetarian: false, glutenFree: true, organic: false, vegan: false, lactoseFree: true, price: 10.00, img: "images/salmon.png" },

  // Pantry
  { name: "Bread", category: "Pantry", vegetarian: true, glutenFree: false, organic: false, vegan: false, lactoseFree: true, price: 2.35, img: "images/bread.png" },
  { name: "Pasta", category: "Pantry", vegetarian: true, glutenFree: false, organic: false, vegan: false, lactoseFree: true, price: 2.89, img:"images/pasta.png" },
  { name: "Eggs", category: "Pantry", vegetarian: true, glutenFree: true, organic: true, vegan: false, lactoseFree: true, price: 4.29, img:"images/eggs.png" },
  { name: "Tofu", category: "Pantry", vegetarian: true, glutenFree: true, organic: true, vegan: true, lactoseFree: true, price: 3.49, img: "images/tofu.png" },
  { name: "Almond Milk", category: "Dairy", vegetarian: true, glutenFree: true, organic: true, vegan: true, lactoseFree: true, price: 3.49, img:"images/almondMilk.png" }
];

/*
  restrictListProducts:
  - prods: full product list
  - prefs: { vegetarian, glutenFree, lactoseFree, vegan, organicChoice, category }
  - sortOrder: "asc" | "desc"
  Returns: array of product objects (filtered + sorted)
*/
function restrictListProducts(prods, prefs, sortOrder = "asc") {
  let filtered = prods.filter(p => {
    // Category (optional)
    if (prefs.category && prefs.category !== "All" && p.category !== prefs.category) return false;

    // Dietary
    if (prefs.vegetarian && !p.vegetarian) return false;
    if (prefs.glutenFree && !p.glutenFree) return false;
    if (prefs.lactoseFree && !p.lactoseFree) return false;
    if (prefs.vegan && !p.vegan) return false;

    // Organic preference
    if (prefs.organicChoice === "Organic" && !p.organic) return false;
    if (prefs.organicChoice === "NonOrganic" && p.organic) return false;

    return true;
  });

  // Sort by price
  filtered.sort((a, b) => (sortOrder === "desc" ? b.price - a.price : a.price - b.price));

  return filtered;
}

/*
  getTotalPrice:
  - takes an array of product names (strings)
  - returns total numeric price
*/
function getTotalPrice(chosenProducts) {
  let totalPrice = 0;

  for (let i = 0; i < chosenProducts.length; i++) {
    const name = chosenProducts[i];
    const prodObj = products.find(p => p.name === name);
    if (prodObj) totalPrice += prodObj.price;
  }

  return totalPrice;
}
