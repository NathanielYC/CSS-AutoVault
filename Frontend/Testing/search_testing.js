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

// Function to fetch models based on selected brand and year
async function fetchModels() {
    const brand = brandDropdown.value;
    const year = yearDropdown.value;

    // Reset model dropdown before adding new options
    resetDropdown(modelDropdown);

    // Ensure both brand and year are selected
    if (!brand || !year) {
        console.log("Both brand and year must be selected to fetch models.");
        return;
    }

    try {
        // Corrected syntax for template literal
        const apiUrl = `https://4k0jzsmg0k.execute-api.us-east-1.amazonaws.com/Testing/getCars?carbrand=${brand}&modelyear=${year}`;
        console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.status}`);

        const data = await response.json();
        const models = JSON.parse(data.body); // Parse models from API response

        // Populate model dropdown if models are available
        if (Array.isArray(models) && models.length > 0) {
            models.forEach(car => {
                const option = document.createElement('option');
                option.value = car.ModelID;
                option.text = car.ModelName;
                modelDropdown.appendChild(option);
            });
        } else {
            console.error('No models available:', models);
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

// Function to fetch NHTSA data based on selected model (dynamically handles selected vehicle)
async function fetchBrandData() {
    const brand = brandDropdown.value.toLowerCase(); // NHTSA API expects lowercase
    const year = yearDropdown.value;
    const model = modelDropdown.options[modelDropdown.selectedIndex].text.toLowerCase(); // Get model name in lowercase

    if (!brand || !year || !model) return; // Ensure all selections are made

    // Format model name for NHTSA API
    const formattedModel = model.replace(/\s+/g, '%20'); 
    const apiUrl = `https://api.nhtsa.gov/SafetyRatings/modelyear/${year}/make/${brand}/model/${formattedModel}`;
    console.log("Fetching NHTSA data from:", apiUrl);

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch NHTSA data: ${response.status}`);

        const data = await response.json();
        const vehicleId = data.Results[0]?.VehicleId; // Use the first VehicleId if it exists

        if (vehicleId) {
            await fetchVehicleDetails(vehicleId); // Fetch detailed info for the selected vehicle
        } else {
            console.error('No vehicle data found for this model.');
        }
    } catch (error) {
        console.error('Error fetching NHTSA data:', error);
    }
}

// Function to fetch vehicle details based on VehicleId and handle empty JSON responses
async function fetchVehicleDetails(vehicleId) {
    const vehicleDetailUrl = `https://api.nhtsa.gov/SafetyRatings/VehicleId/${vehicleId}`;

    try {
        const vehicleResponse = await fetch(vehicleDetailUrl);
        if (!vehicleResponse.ok) throw new Error(`Failed to fetch vehicle details: ${vehicleResponse.status}`);

        const vehicleData = await vehicleResponse.json();

        if (vehicleData.Results && vehicleData.Results.length > 0) {
            // Extract relevant data from the response
            const vehicle = vehicleData.Results[0];
            const vehiclePicture = vehicle.VehiclePicture || "No picture available"; // Placeholder if no picture is provided
            const overallRating = vehicle.OverallRating || "No rating available";
            const recallsCount = vehicle.RecallsCount || "No recall information";

            // Display the detailed vehicle information
            displayCarInfo(vehiclePicture, overallRating, recallsCount);
        } else {
            console.error('NHTSA API returned empty data. API may not have information for this vehicle.');
        }
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
    }
}

// Function to display vehicle details in the car info section
function displayCarInfo(vehiclePicture, overallRating, recallsCount) {
    carInfoCard.style.display = 'block';
    carInfoDiv.innerHTML = `
        <div class="car-info-item"><strong>Vehicle Image:</strong><br><img src="${vehiclePicture}" alt="Vehicle Image" width="200"></div>
        <div class="car-info-item"><strong>Overall Rating:</strong> ${overallRating}</div>
        <div class="car-info-item"><strong>Recalls Count:</strong> ${recallsCount}</div>
    `;
}


// Add event listener to model dropdown to fetch vehicle details when a model is selected
modelDropdown.addEventListener('change', fetchBrandData);
