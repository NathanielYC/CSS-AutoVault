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

async function fetchModels() {
    const brand = brandDropdown.value;
    const year = yearDropdown.value;

    // Reset model dropdown before adding new options
    resetDropdown(modelDropdown);

    //Testing API 
    if (!brand || !year) {
        console.log("Both brand and year must be selected to fetch models.");
        return;
    }

    try {
        const apiUrl = `https://4k0jzsmg0k.execute-api.us-east-1.amazonaws.com/Testing/getCars?carbrand=${brand}&modelyear=${year}`;
        
        //See if calling API properly
        console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error(`Failed to fetch models: ${response.status}`);

        const data = await response.json();

        // Parse `data.body` since it's a JSON string
        const models = JSON.parse(data.body);

        // Populate model dropdown if models is an array
        // THis is to make the dropdown buttons grab the models dynamically
        //FOrd gets all ford models
        //Dodge gets dodge models
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







//Container Card display infomation
function displayCarInfo() {
    
    const selectedModelId = modelDropdown.value;
    const selectedModelIndex = modelDropdown.selectedIndex;
    const brand = brandDropdown.options[brandDropdown.selectedIndex].text;
    const year = yearDropdown.value;

    const modelName = modelDropdown.options[selectedModelIndex].text;

    if (selectedModelId) {
        carInfoCard.style.display = 'block';

        carInfoDiv.innerHTML = `
            <div class="car-info-item"><strong>Brand:</strong> ${brand}</div>
            <div class="car-info-item"><strong>Year:</strong> ${year}</div>
            <div class="car-info-item"><strong>Model ID:</strong> ${selectedModelId}</div>
            <div class="car-info-item"><strong>Model Name:</strong> ${modelName}</div>
        `;
    } else {
        carInfoCard.style.display = 'none';
    }
}


// Add event listeners to brand and year dropdowns
brandDropdown.addEventListener('change', fetchModels);
yearDropdown.addEventListener('change', fetchModels);
modelDropdown.addEventListener('change', displayCarInfo);
