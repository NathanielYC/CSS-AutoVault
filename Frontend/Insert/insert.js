document.getElementById('vehicleForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form reload

    const modelID = document.getElementById('modelID').value;
    const modelName = document.getElementById('modelName').value;
    const modelYear = document.getElementById('modelYear').value;
    const carBrand = document.getElementById('carBrand').value;

    // Payload to send to Lambda
    const vehicleData = { ModelID: modelID, ModelName: modelName, ModelYear: modelYear, CarBrand: carBrand };

    try {
        // Send data to Lambda
        const response = await fetch('https://wsk3k1flsa.execute-api.us-east-1.amazonaws.com/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehicleData),
        });

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return;
        }

        const data = await response.json();
        console.log("Response data:", data);

        // Extract data from the response
        const modelIDResponse = data.modelID;
        const modelNameResponse = data.modelName;
        const modelYearResponse = data.modelYear;
        const carBrandResponse = data.carBrand;

        console.log(`Received ModelID: ${modelIDResponse}, ModelName: ${modelNameResponse}, ModelYear: ${modelYearResponse}, CarBrand: ${carBrandResponse}`);

        // Update UI with success message
        document.getElementById('responseMessage').textContent = data.message || 'Vehicle inserted successfully';

        // Show insertion details in the table
        const vehicleDetailsSection = document.getElementById("vehicleDetails");
        vehicleDetailsSection.style.display = "block";

        const tableBody = vehicleDetailsSection.querySelector("tbody");
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>${modelIDResponse}</td>
            <td>${modelNameResponse}</td>
            <td>${modelYearResponse}</td>
            <td>${carBrandResponse}</td>
        `;

        tableBody.appendChild(newRow);

    } catch (error) {
        console.error('Request failed:', error);
        document.getElementById('responseMessage').textContent = 'Error inserting vehicle';
    }
});
