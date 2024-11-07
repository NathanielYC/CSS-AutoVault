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
// THis should work now
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


//**************** */
//Hardcoded NHSTA API Starts here, this needs to by dynamic based on fetchModels() paramaters
//So like when dodge charger 2022 is selected, it will return from the nhsta api website dodge charger 2022 json info
//Or if honda 2021 accord is selected, then nhsta api will return json info for that
//https://api.nhtsa.gov/SafetyRatings/modelyear/2022/make/dodge/model/charger
//https://api.nhtsa.gov/SafetyRatings/modelyear/2021/make/honda/model/accord
//**************** */

// Hardcoded Function to fetch detailed information for a specific VehicleId (14270)
// VehicleId will need to by dynamic based on search parameters from the fetchModels()
// Function to fetch data for vehicalID from the results of this api https://api.nhtsa.gov/SafetyRatings/modelyear/2020/make/dodge/model/charger
//Do not want to return all info from fetchVehicalDetails()
//just this info from this website https://api.nhtsa.gov/SafetyRatings/VehicleId/14270
//{
//    "Count": 1,
//    "Message": "Results returned successfully",
//    "Results": [
//      {
//        "VehiclePicture": "https://static.nhtsa.gov/images/vehicles/14288_st0640_046.png",
//        "OverallRating": "5",
//        "RecallsCount": 3
//      }
//    ]
//  }
//If you want to add other information, go ahead, whatever you think is best or fun to show 
async function fetchVehicleDetails(vehicleId) {
    const vehicleDetailUrl = `https://api.nhtsa.gov/SafetyRatings/VehicleId/${vehicleId}`;

    try {
        const vehicleResponse = await fetch(vehicleDetailUrl);
        if (!vehicleResponse.ok) throw new Error(`Failed to fetch vehicle details: ${vehicleResponse.status}`);

        const vehicleData = await vehicleResponse.json();

        // Display the detailed vehicle JSON result in the container card
        //This needs to be fixed i think, removed and put this info into the displayCarInfo() function 
        //at the very bottom of this codebase
        carInfoCard.style.display = 'block';
        carInfoDiv.innerHTML += `<h3>Vehicle Details for ID ${vehicleId}</h3><pre>${JSON.stringify(vehicleData, null, 2)}</pre>`;
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
    }
}

//This next function fetchDodgeData() needs to be synced with the fetchmodels() function, Also probably change this function name to like fetchBrandData()
//return info from here, this seems to return a bunch of different models, like some are rwd or awd or 2wd or 4wd
//have to just pick one vehicleid and use it, and discard the other data, so like probably first json entry use that and discard the other vehicleid
//For example, this https://api.nhtsa.gov/SafetyRatings/modelyear/2020/make/ford/model/F-150%20REGULAR%20CAB returns this
//{
//    "Count": 2,
//    "Message": "Results returned successfully",
//    "Results": [
//      {
//        "VehicleDescription": "2020 Ford F-150 Regular Cab PU/RC 4WD",
//        "VehicleId": 14941
//      },
//      {
//        "VehicleDescription": "2020 Ford F-150 Regular Cab PU/RC 2WD",
//        "VehicleId": 14914
//      }
//    ]
//  }
//I think we just say if count is greater than 1, just use the first vehicleID
//Also another tip to find api endpoints, have to use this link https://api.nhtsa.gov/SafetyRatings/modelyear/2020/make/Ford   Change make name if you want honda or other car brands
//and in the model part https://api.nhtsa.gov/SafetyRatings/modelyear/2020/make/ford/model/CAPITILIZE ALL LETTERS HERE AND USE %20 for spaces
//For example https://api.nhtsa.gov/SafetyRatings/modelyear/2020/make/Ford/model/ESCAPE%20PHEV
async function fetchDodgeData() {
    const dodgeApiUrl = 'https://api.nhtsa.gov/SafetyRatings/modelyear/2020/make/dodge/model/charger';

    try {
        const dodgeResponse = await fetch(dodgeApiUrl);
        if (!dodgeResponse.ok) throw new Error(`Failed to fetch Dodge data: ${dodgeResponse.status}`);

        const dodgeData = await dodgeResponse.json();

        // Display the Dodge data in the container card
        //Think this needs to be deleted and just use fetchCombinedData() or displayCarInfo()
        //This function just needs to fetch brand data
        carInfoCard.style.display = 'block';
        carInfoDiv.innerHTML += `<h3>Dodge Charger Models (2020)</h3><pre>${JSON.stringify(dodgeData, null, 2)}</pre>`;
    } catch (error) {
        console.error('Error fetching Dodge data:', error);
    }
}


 

// Function to fetch both Dodge data and vehicle details
//This will need to go into the container card in displayCarInfo()  
async function fetchCombinedData() {
    carInfoDiv.innerHTML = '';  // Clear previous data display
    await fetchDodgeData();     // Fetch Dodge models data
    await fetchVehicleDetails(14270); // Fetch details for specific VehicleId 14270
}

// Add an event listener to fetch both sets of data
modelDropdown.addEventListener('change', fetchCombinedData);

//**************** */
//Hardcoded nhsta api ends here
//***************** */


//*************** */
//This will probably need to be changed to allow for nhsta api json to return here in a pretty css style.
//***************** */
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
