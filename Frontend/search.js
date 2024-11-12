// Get the dropdown elements
const brandDropdown = document.getElementById('brand-dropdown');
const yearDropdown = document.getElementById('year-dropdown');
const modelDropdown = document.getElementById('model-dropdown');
const carInfoCard = document.getElementById('car-info-card');
const carInfoDiv = document.getElementById('car-info');

// Event listeners for brand and year dropdowns
brandDropdown.addEventListener('change', fetchModels);
yearDropdown.addEventListener('change', fetchModels);

// Function to reset and populate model dropdown
function resetDropdown(dropdown, defaultText = 'Select Model') {
    dropdown.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = defaultText;
    dropdown.appendChild(defaultOption);
}

// Fetch models from your API and populate the model dropdown
async function fetchModels() {
    const brand = brandDropdown.value;
    const year = yearDropdown.value;

    // Reset model dropdown before adding new options
    resetDropdown(modelDropdown);

    if (!brand || !year) {
        console.log("Both brand and year must be selected to fetch models.");
        return;
    }

    try {
        const apiUrl = `https://4k0jzsmg0k.execute-api.us-east-1.amazonaws.com/Testing/getCars?carbrand=${brand}&modelyear=${year}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.status}`);
        const data = await response.json();
        const models = JSON.parse(data.body);

        if (Array.isArray(models)) {
            models.forEach(car => {
                const option = document.createElement('option');
                option.value = car.ModelID;
                option.text = car.ModelName;
                modelDropdown.appendChild(option);
            });
        } else {
            console.error('Expected an array in models:', models);
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

// Function to fetch data for selected brand, year, and model
async function fetchSelectedVehicleData() {
    const brand = brandDropdown.value.toUpperCase(); // NHTSA requires brand in uppercase
    const year = yearDropdown.value;
    const modelName = modelDropdown.options[modelDropdown.selectedIndex].text.toUpperCase().replace(/ /g, "%20");

    if (!brand || !year || !modelName) {
        console.log("Brand, year, and model must be selected to fetch vehicle data.");
        return;
    }

    const nhtsaUrl = `https://api.nhtsa.gov/SafetyRatings/modelyear/${year}/make/${brand}/model/${modelName}`;
    try {
        const response = await fetch(nhtsaUrl);
        if (!response.ok) throw new Error(`Failed to fetch vehicle data: ${response.status}`);
        const data = await response.json();

        // Assuming first vehicle ID if multiple are returned
        const vehicleId = data.Results[0]?.VehicleId;
        if (vehicleId) {
            fetchVehicleDetails(vehicleId);
        } else {
            console.log("No vehicle ID found for the selected model.");
            displayCarInfo(null); // Indicate no data available
        }
    } catch (error) {
        console.error('Error fetching vehicle data:', error);
    }
}

// Fetch detailed vehicle information using Vehicle ID
async function fetchVehicleDetails(vehicleId) {
    const vehicleDetailUrl = `https://api.nhtsa.gov/SafetyRatings/VehicleId/${vehicleId}`;
    try {
        const response = await fetch(vehicleDetailUrl);
        if (!response.ok) throw new Error(`Failed to fetch vehicle details: ${response.status}`);
        const data = await response.json();

        const vehicleDetails = data.Results[0];
        displayCarInfo(vehicleDetails);
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
    }
}

function displayCarInfo(vehicleDetails) {
    if (!vehicleDetails || Object.keys(vehicleDetails).length === 0) {
        carInfoCard.style.display = 'block';
        carInfoDiv.innerHTML = `
            <div class="no-data-available">
                NO CAR DATA AVAILABLE
            </div>
        `;
        return; // Exit the function if no data is available
    }

    const brand = brandDropdown.options[brandDropdown.selectedIndex].text;
    const year = yearDropdown.value;
    const modelName = modelDropdown.options[modelDropdown.selectedIndex].text;

    // Check if vehicleDetails is undefined or has no data
    if (!vehicleDetails || Object.keys(vehicleDetails).length === 0) {
        carInfoCard.style.display = 'block';
        carInfoDiv.innerHTML = `
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: red;">
                NO CAR DATA AVAILABLE
            </div>
        `;
        return; // Exit the function if no data is available
    }

    // Define the placeholder image path for missing images
    const placeholderImage = "Images/nocar.png";
    const vehicleImage = vehicleDetails.VehiclePicture ? vehicleDetails.VehiclePicture : placeholderImage;
    console.log("Vehicle Image URL:", vehicleImage);

    carInfoCard.style.display = 'block';
    carInfoDiv.innerHTML = `
        <div class="car-info-left">
            <div class="car-info-item"><strong>Brand:</strong> ${brand}</div>
            <div class="car-info-item"><strong>Year:</strong> ${year}</div>
            <div class="car-info-item"><strong>Model Name:</strong> ${modelName}</div>
            <div class="car-info-item"><strong>Overall Rating:</strong> ${vehicleDetails.OverallRating ?? "N/A"}</div>
            <div class="car-info-item"><strong>Recalls Count:</strong> ${vehicleDetails.RecallsCount ?? "N/A"}</div>
        </div>
        <div class="car-info-right">
            <img src="${vehicleImage}" alt="Vehicle Image">
        </div>
    `;
}



// Add event listener for model dropdown change to trigger fetching detailed data
modelDropdown.addEventListener('change', fetchSelectedVehicleData);