
// EASYCOOK - RECIPE EXPLORER


// TheMealDB API URL
const API_URL = "https://www.themealdb.com/api/json/v1/1/";

// Get HTML elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const categoryButton = document.getElementById("categoryButton");

const suggestionMessage = document.getElementById("suggestionMessage");
const suggestionResults = document.getElementById("suggestionResults");
const statusMessage = document.getElementById("statusMessage");
const recipeResults = document.getElementById("recipeResults");

const mealPlanList = document.getElementById("mealPlanList");


//======================
// SEARCH RECIPE BY NAME

async function searchRecipes() {
    const keyword = searchInput.value.trim();

    if (keyword === "") {
        statusMessage.textContent = "Please enter a recipe name.";
        return;
    }

    statusMessage.textContent = "Searching for recipes...";
    recipeResults.innerHTML = "";

    try {
        const response = await fetch(
            API_URL + "search.php?s=" + encodeURIComponent(keyword)
        );

        if (!response.ok) {
            throw new Error("Unable to connect to the recipe service.");
        }

        const data = await response.json();

        if (data.meals === null || !data.meals) {
            statusMessage.textContent = "No recipes found. Try another keyword.";
            return;
        }

        statusMessage.textContent =
            "Found " + data.meals.length + " recipe(s).";

        displayRecipes(data.meals);
        generateSuggestions(data.meals);

    } catch (error) {
        console.error("Search error:", error);

        statusMessage.textContent =
            "Unable to load recipes. Please check your internet connection.";
    }
}

// Run search when the form is submitted
searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    searchRecipes();
});
//======================


//======================
// SEARCH BY CATEGORY

async function searchByCategory() {
    const category = categorySelect.value;

    if (category === "") {
        statusMessage.textContent = "Please select a recipe category.";
        return;
    }

    statusMessage.textContent = "Loading category recipes...";
    recipeResults.innerHTML = "";

    try {
        const response = await fetch(
            API_URL + "filter.php?c=" + encodeURIComponent(category)
        );

        if (!response.ok) {
            throw new Error("Unable to load the selected category.");
        }

        const data = await response.json();

        if (!data.meals) {
            statusMessage.textContent =
                "No recipes found in this category.";
            return;
        }

        statusMessage.textContent =
            "Found " + data.meals.length + " recipe(s) in " + category + ".";

        displayRecipes(data.meals);
        generateSuggestions(data.meals);

    } catch (error) {
        console.error("Category error:", error);

        statusMessage.textContent =
            "Unable to load recipes. Please try again.";
    }
}

// Run category search when the button is clicked
categoryButton.addEventListener("click", searchByCategory);
//======================


//======================
// DISPLAY RECIPE CARDS

function displayRecipes(meals) {
    recipeResults.innerHTML = "";

    meals.forEach(function(meal) {
        const recipeCard = document.createElement("div");
        recipeCard.className = "recipe-card";

        // Recipe image
        const recipeImage = document.createElement("img");
        recipeImage.src = meal.strMealThumb || "";
        recipeImage.alt = meal.strMeal || "Recipe image";
        recipeImage.style.width = "100%";

        // Recipe name
        const recipeName = document.createElement("h3");
        recipeName.textContent = meal.strMeal || "Unnamed Recipe";

        // Recipe category or ID
        const recipeInfo = document.createElement("p");

        if (meal.strCategory) {
            recipeInfo.textContent = "Category: " + meal.strCategory;
        } else {
            recipeInfo.textContent = "Recipe ID: " + meal.idMeal;
        }

        // View details button
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "View Details";

        detailsButton.addEventListener("click", function() {
            viewRecipeDetails(meal.idMeal);
        });

        // Save recipe button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save Recipe";

        saveButton.addEventListener("click", function() {
            saveRecipe(meal);
        });

        recipeCard.appendChild(recipeImage);
        recipeCard.appendChild(recipeName);
        recipeCard.appendChild(recipeInfo);
        recipeCard.appendChild(detailsButton);
        recipeCard.appendChild(saveButton);

        recipeResults.appendChild(recipeCard);
    });
}
//======================


//======================
// VIEW RECIPE DETAILS

async function viewRecipeDetails(idMeal) {
    statusMessage.textContent = "Loading recipe details...";

    try {
        const response = await fetch(
            API_URL + "lookup.php?i=" + encodeURIComponent(idMeal)
        );

        if (!response.ok) {
            throw new Error("Unable to load recipe details.");
        }

        const data = await response.json();

        if (!data.meals || data.meals.length === 0) {
            statusMessage.textContent = "Recipe details not found.";
            return;
        }

        const meal = data.meals[0];

        // Get ingredients and measurements
        const ingredients = [];

        for (let i = 1; i <= 20; i++) {
            const ingredient = meal["strIngredient" + i];
            const measure = meal["strMeasure" + i];

            if (ingredient && ingredient.trim() !== "") {
                ingredients.push(
                    (measure ? measure.trim() + " " : "") +
                    ingredient.trim()
                );
            }
        }

        // Display details in a styled popup
        showRecipeModal(meal, ingredients);

        statusMessage.textContent =
            "Showing details for " + meal.strMeal + ".";

    } catch (error) {
        console.error("Recipe details error:", error);

        statusMessage.textContent =
            "Unable to load recipe details. Please try again.";
    }
}
//======================


//======================
// RECIPE DETAILS POPUP (MODAL)

function closeRecipeModal() {
    const existingModal = document.querySelector(".modal-overlay");

    if (existingModal) {
        existingModal.remove();
    }

    document.removeEventListener("keydown", handleModalKey);
}

function handleModalKey(event) {
    if (event.key === "Escape") {
        closeRecipeModal();
    }
}

function showRecipeModal(meal, ingredients) {
    // Remove any modal that is already open
    closeRecipeModal();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    // Close when clicking outside the modal box
    overlay.addEventListener("click", function(event) {
        if (event.target === overlay) {
            closeRecipeModal();
        }
    });

    const modal = document.createElement("div");
    modal.className = "modal";

    // Close button
    const closeButton = document.createElement("button");
    closeButton.className = "modal-close";
    closeButton.textContent = "\u00D7";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.addEventListener("click", closeRecipeModal);

    // Recipe image
    const image = document.createElement("img");
    image.src = meal.strMealThumb || "";
    image.alt = meal.strMeal || "Recipe image";

    // Recipe name
    const title = document.createElement("h2");
    title.textContent = meal.strMeal || "Unnamed Recipe";

    // Category and area tags
    const tags = document.createElement("div");
    tags.className = "modal-tags";

    if (meal.strCategory) {
        const categoryTag = document.createElement("span");
        categoryTag.className = "modal-tag";
        categoryTag.textContent = meal.strCategory;
        tags.appendChild(categoryTag);
    }

    if (meal.strArea) {
        const areaTag = document.createElement("span");
        areaTag.className = "modal-tag";
        areaTag.textContent = meal.strArea;
        tags.appendChild(areaTag);
    }

    // Ingredients list
    const ingredientsTitle = document.createElement("h3");
    ingredientsTitle.textContent = "Ingredients";

    const ingredientList = document.createElement("ul");
    ingredientList.className = "modal-ingredients";

    ingredients.forEach(function(item) {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        ingredientList.appendChild(listItem);
    });

    // Instructions (one paragraph per line)
    const instructionsTitle = document.createElement("h3");
    instructionsTitle.textContent = "Instructions";

    const instructionsBox = document.createElement("div");
    instructionsBox.className = "modal-instructions";

    const steps = (meal.strInstructions || "Not available")
        .split(/\r?\n/)
        .filter(function(line) {
            return line.trim() !== "";
        });

    steps.forEach(function(line) {
        const paragraph = document.createElement("p");
        paragraph.textContent = line.trim();
        instructionsBox.appendChild(paragraph);
    });

    modal.appendChild(closeButton);
    modal.appendChild(image);
    modal.appendChild(title);
    modal.appendChild(tags);
    modal.appendChild(ingredientsTitle);
    modal.appendChild(ingredientList);
    modal.appendChild(instructionsTitle);
    modal.appendChild(instructionsBox);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close with the Escape key
    document.addEventListener("keydown", handleModalKey);
}
//======================


//======================
// SAVE RECIPE TO LOCAL STORAGE

function saveRecipe(meal) {
    // Get existing saved recipes
    let savedMeals = [];

    try {
        const storedMeals = localStorage.getItem("mealPlans");

        if (storedMeals !== null) {
            savedMeals = JSON.parse(storedMeals);
        }

        if (!Array.isArray(savedMeals)) {
            savedMeals = [];
        }

    } catch (error) {
        console.error("Error reading Local Storage:", error);

        statusMessage.textContent =
            "Unable to read saved recipes.";
        return;
    }

    // Check whether the recipe is already saved
    const alreadySaved = savedMeals.some(function(savedMeal) {
        return String(savedMeal.idMeal) === String(meal.idMeal);
    });

    if (alreadySaved) {
        statusMessage.textContent =
            meal.strMeal + " is already saved.";
        return;
    }

    // Add recipe to saved recipes
    savedMeals.push({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb
    });

    // Store recipes in Local Storage
    try {
        localStorage.setItem("mealPlans", JSON.stringify(savedMeals));

        statusMessage.textContent =
            meal.strMeal + " has been saved successfully.";

        // Refresh saved recipes on the main menu
        displayMealPlans();

        // Popup message
        alert(meal.strMeal + " has been added to your saved recipes!");

    } catch (error) {
        console.error("Error saving recipe:", error);

        statusMessage.textContent =
            "Unable to save the recipe. Please try again.";
    }
}
//======================


//======================
// RECIPE SUGGESTIONS


function generateSuggestions(meals) {
    suggestionResults.innerHTML = "";

    if (!meals || meals.length === 0) {
        suggestionMessage.textContent =
            "No suggestions available.";
        return;
    }

    let suggestions = [];

    // Suggestion logic using if/else
    if (meals.length >= 5) {
        suggestions = meals.slice(0, 3);

        suggestionMessage.textContent =
            "We found several recipes! Here are three suggestions.";

    } else if (meals.length >= 2) {
        suggestions = meals.slice(0, 2);

        suggestionMessage.textContent =
            "Here are some recipes you might like.";

    } else {
        suggestions = meals;

        suggestionMessage.textContent =
            "Here is a recipe suggestion for you.";
    }

    // Display suggested recipes
    suggestions.forEach(function(meal) {
        const suggestionCard = document.createElement("div");
        suggestionCard.className = "recipe-card";

        const suggestionName = document.createElement("h3");
        suggestionName.textContent = meal.strMeal;

        const suggestionImage = document.createElement("img");
        suggestionImage.src = meal.strMealThumb || "";
        suggestionImage.alt = meal.strMeal || "Recipe image";
        suggestionImage.style.width = "100%";

        const viewButton = document.createElement("button");
        viewButton.textContent = "View Details";

        viewButton.addEventListener("click", function() {
            viewRecipeDetails(meal.idMeal);
        });

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save Recipe";

        saveButton.addEventListener("click", function() {
            saveRecipe(meal);
        });

        suggestionCard.appendChild(suggestionImage);
        suggestionCard.appendChild(suggestionName);
        suggestionCard.appendChild(viewButton);
        suggestionCard.appendChild(saveButton);

        suggestionResults.appendChild(suggestionCard);
    });
}
//======================


//======================
// LOCAL STORAGE HELPERS


// Get saved recipes from Local Storage
function getMealPlans() {
    const savedMeals = localStorage.getItem("mealPlans");

    if (savedMeals === null) {
        return [];
    }

    try {
        const meals = JSON.parse(savedMeals);

        if (Array.isArray(meals)) {
            return meals;
        }

        return [];

    } catch (error) {
        console.error("Error reading saved recipes:", error);
        return [];
    }
}

// Save recipes to Local Storage
function saveMealPlans(meals) {
    try {
        localStorage.setItem("mealPlans", JSON.stringify(meals));
        return true;

    } catch (error) {
        console.error("Error saving recipes:", error);
        alert("Unable to save recipes. Please try again.");
        return false;
    }
}
//======================


//======================
// DISPLAY SAVED RECIPES


function displayMealPlans() {
    const meals = getMealPlans();

    // Clear existing content
    mealPlanList.innerHTML = "";

    // Display message if there are no saved recipes
    if (meals.length === 0) {
        mealPlanList.textContent = "No saved recipes yet.";
        return;
    }

    // Display each saved recipe
    meals.forEach(function(meal) {
        const mealCard = document.createElement("div");
        mealCard.className = "recipe-card";

        // Recipe image
        if (meal.strMealThumb) {
            const mealImage = document.createElement("img");
            mealImage.src = meal.strMealThumb;
            mealImage.alt = meal.strMeal || "Recipe image";
            mealImage.style.width = "100%";
            mealCard.appendChild(mealImage);
        }

        // Recipe name
        const mealName = document.createElement("h3");
        mealName.textContent = meal.strMeal || "Unnamed Recipe";
        mealCard.appendChild(mealName);

        const mealId = document.createElement("p");
        mealId.textContent = "Recipe ID: " + meal.idMeal;
        mealCard.appendChild(mealId);

        // View details button
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "View Details";

        detailsButton.addEventListener("click", function() {
            viewRecipeDetails(meal.idMeal);
        });

        // Edit button (swaps the title for an input + save button)
        const editButton = document.createElement("button");
        editButton.textContent = "Edit Recipe Name";

        editButton.addEventListener("click", function() {
            const input = document.createElement("input");
            input.type = "text";
            input.value = meal.strMeal;

            const saveBtn = document.createElement("button");
            saveBtn.textContent = "Save";

            saveBtn.addEventListener("click", function() {
                updateMealPlan(meal.idMeal, input.value);
            });

            mealCard.replaceChild(input, mealName);
            mealCard.replaceChild(saveBtn, editButton);
            input.focus();
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Recipe";

        deleteButton.addEventListener("click", function() {
            deleteMealPlan(meal.idMeal);
        });

        mealCard.appendChild(detailsButton);
        mealCard.appendChild(editButton);
        mealCard.appendChild(deleteButton);

        mealPlanList.appendChild(mealCard);
    });
}
//======================


//======================
// UPDATE SAVED RECIPE

function updateMealPlan(idMeal, newName) {
    const meals = getMealPlans();

    // Find the selected recipe
    const meal = meals.find(function(item) {
        return String(item.idMeal) === String(idMeal);
    });

    if (!meal) {
        statusMessage.textContent = "Recipe not found!";
        return;
    }

    // Validate the new name
    if (newName.trim() === "") {
        statusMessage.textContent = "Recipe name cannot be empty!";
        return;
    }

    // Update the recipe name
    meal.strMeal = newName.trim();

    // Save once, then refresh the list
    if (saveMealPlans(meals)) {
        displayMealPlans();

        // Popup message
        alert("Recipe name updated successfully!");
    }
}
//======================


//======================
// DELETE SAVED RECIPE

function deleteMealPlan(idMeal) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this recipe?"
    );

    if (!confirmDelete) {
        return;
    }

    const meals = getMealPlans();

    // Remove the selected recipe
    const updatedMeals = meals.filter(function(meal) {
        return String(meal.idMeal) !== String(idMeal);
    });

    // Save the updated list
    if (saveMealPlans(updatedMeals)) {
        displayMealPlans();
        alert("Recipe deleted successfully!");
    }
}
//======================


//======================
// DISPLAY SAVED RECIPES WHEN THE PAGE LOADS


document.addEventListener("DOMContentLoaded", function() {
    displayMealPlans();
});
//======================