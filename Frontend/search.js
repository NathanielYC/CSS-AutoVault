// Get the dropdown elements
const brandDropdown = document.getElementById('brand-dropdown');
const yearDropdown = document.getElementById('year-dropdown');
const modelDropdown = document.getElementById('model-dropdown');
const carInfoCard = document.getElementById('car-info-card');
const carInfoDiv = document.getElementById('car-info');

// Function to fetch models based on brand and year
function fetchModels() {
    const brand = brandDropdown.value;
    const year = yearDropdown.value;

    // This is to reset the models dropdown options if changing paramaters for different brands
    //Example When picking Dodge, only show Dodge models, and then reset when switching to Ford
    //To only show Ford models
    //But this doesn't work so lmao
    modelDropdown.options.length = 0;
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select Model';
    modelDropdown.appendChild(defaultOption);

    // If both brand and year are selected, fetch car models
    if (brand && year) {
        console.log(`Fetching models with brand: ${brand} and year: ${year}`);

        // API call to fetch car models
        fetch(`https://4k0jzsmg0k.execute-api.us-east-1.amazonaws.com/Testing/getCars?make=${brand}&year=${year}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data);

                // Parse the body if it's a string
                let models = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

                console.log('Parsed models:', models);
                if (Array.isArray(models)) {
                    models.forEach(function(model) {
                        const option = document.createElement('option');
                        option.value = model.toLowerCase();
                        option.text = model;
                        modelDropdown.appendChild(option);
                    });
                } else {
                    console.error('Expected an array, got:', models);
                }
            })
            .catch(error => console.error('Error fetching models:', error));
    }
}

// Function to show selected car info in the card
function displayCarInfo() {
    const selectedModel = modelDropdown.value;
    const brand = brandDropdown.options[brandDropdown.selectedIndex].text;
    const year = yearDropdown.value;

    // Show the card only if a model is selected
    if (selectedModel) {
        carInfoCard.style.display = 'block';

        // Populate the car information
        carInfoDiv.innerHTML = `
            <div class="car-info-item"><strong>Brand:</strong> ${brand}</div>
            <div class="car-info-item"><strong>Year:</strong> ${year}</div>
            <div class="car-info-item"><strong>Model:</strong> ${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}</div>
        `;
    } else {
        carInfoCard.style.display = 'none';
    }
}

// Add event listeners to both brand and year dropdowns
brandDropdown.addEventListener('change', fetchModels);
yearDropdown.addEventListener('change', fetchModels);
modelDropdown.addEventListener('change', displayCarInfo);
