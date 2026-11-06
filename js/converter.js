
const mealPlanList = document.getElementById("mealPlanList");

const conversionValue = document.getElementById("conversionValue");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const convertButton = document.getElementById("convertButton");
const conversionResult = document.getElementById("conversionResult");

//UNIT CONVERTER

const conversionFactors = {
    // Weight
    mg: 0.001,
    g: 1,
    kg: 1000,

    // Volume
    ml: 1,
    L: 1000,
    tsp: 4.92892,
    tbsp: 14.7868,
    cup: 236.588
};


// Determine whether a unit measures weight or volume
function getUnitCategory(unit) {
    if (unit === "mg" || unit === "g" || unit === "kg") {
        return "weight";
    }

    if (
        unit === "ml" ||
        unit === "L" ||
        unit === "tsp" ||
        unit === "tbsp" ||
        unit === "cup"
    ) {
        return "volume";
    }

    return "unknown";
}


// Convert the entered value
function convertUnits() {
    const input = conversionValue.value;
    const value = Number(input);

    const from = fromUnit.value;
    const to = toUnit.value;

    // Check for empty or invalid input
    if (
        input.trim() === "" ||
        !Number.isFinite(value) ||
        value < 0
    ) {
        conversionResult.textContent =
            "Please enter a valid number greater than or equal to zero.";
        return;
    }

    // Check that both units belong to the same category
    if (getUnitCategory(from) !== getUnitCategory(to)) {
        conversionResult.textContent =
            "Cannot convert between weight and volume units.";
        return;
    }

    // Convert the input into the base unit
    const baseValue = value * conversionFactors[from];

    // Convert the base unit into the target unit
    const result = baseValue / conversionFactors[to];

    // Round the result to four decimal places
    const roundedResult = Number(result.toFixed(4));

    // Display the result
    conversionResult.textContent =
        value + " " + from + " = " + roundedResult + " " + to;
}

convertButton.addEventListener("click", convertUnits);

displayMealPlans();