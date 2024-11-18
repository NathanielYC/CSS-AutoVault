// API Base URL
const API_BASE_URL = "https://wsk3k1flsa.execute-api.us-east-1.amazonaws.com/test";

async function fetchAllVehicles() {
    const loadingIndicator = document.getElementById("loading");
    const tableBody = document.querySelector("#vehicle-table tbody");

    try {
        loadingIndicator.style.display = "block"; // Show loading indicator

        // Fetch data from the backend
        const response = await fetch(`${API_BASE_URL}/getAllData`);
        if (!response.ok) throw new Error(`Error fetching data: ${response.status}`);

        const data = await response.json();

        // Parse the data if it's nested or in a "body" field
        const vehicles = typeof data.body === "string" ? JSON.parse(data.body) : data.body;

        if (!Array.isArray(vehicles)) {
            console.error("Expected an array in vehicles:", vehicles);
            throw new Error("Invalid data format received from API.");
        }

        // Clear the table
        tableBody.innerHTML = "";

        // Populate the table with data
        vehicles.forEach(vehicle => {

            // Escape single quotes in ModelName and CarBrand
            const safeModelName = vehicle.ModelName.replace(/'/g, "\\'");
            const safeCarBrand = vehicle.CarBrand.replace(/'/g, "\\'");

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${vehicle.ModelID}</td>
                <td>${vehicle.ModelName}</td>
                <td>${vehicle.ModelYear}</td>
                <td>${vehicle.CarBrand}</td>
                <td>
                    <button onclick="deleteVehicle(${vehicle.ModelID}, ${vehicle.ModelYear}, '${safeCarBrand}', '${safeModelName}')">
                        Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        alert("Failed to fetch vehicle data. Please check the console for details.");
    } finally {
        loadingIndicator.style.display = "none"; // Hide loading indicator
    }
}

async function deleteVehicle(modelID, modelYear, carBrand, modelName) {
    console.log("Deleting vehicle:", { modelID, modelYear, carBrand, modelName });

    if (!confirm(`Are you sure you want to delete this vehicle?\nModelID: ${modelID}\nModelYear: ${modelYear}\nCarBrand: ${carBrand}\nModelName: ${modelName}`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/deleteCarData`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ModelID: modelID, ModelYear: modelYear, CarBrand: carBrand, ModelName: modelName })
        });

        // Log the raw response
        console.log("Raw response:", response);

        // Parse the response JSON
        const result = await response.json();
        console.log("Parsed result:", result);

        if (response.ok) {
            alert(result.message); // Show success message
            fetchAllVehicles(); // Refresh the table after deletion
        } else {
            console.error("Backend error:", result.error);
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle. Please check the console for details.");
    }
}


// Initialize: Fetch and Display All Vehicles on Page Load
window.onload = fetchAllVehicles;
