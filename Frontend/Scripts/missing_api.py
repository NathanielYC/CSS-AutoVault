import json
import signal
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Initialize an empty list to store results
results = []

def save_data_and_exit(signal_received, frame):
    """Save the results to JSON and exit on Ctrl+C."""
    print("\nCtrl+C detected. Saving captured data to 'vehicle_data.json'...")
    with open('vehicle_data.json', 'w') as json_file:
        json.dump(results, json_file, indent=2)
    print("Data saved. Exiting...")
    sys.exit(0)

# Attach the signal handler for Ctrl+C
signal.signal(signal.SIGINT, save_data_and_exit)

# Initialize the WebDriver
driver = webdriver.Chrome()  # Replace with the path to your ChromeDriver if needed
driver.get('http://localhost:5500/Frontend/search.html')  # Replace with your actual URL

# Define brand and year options
brands = ["dodge", "ford", "mercedes-benz", "honda"]
years = ["2020", "2021", "2022", "2023", "2024", "2025"]

# WebDriverWait setup
wait = WebDriverWait(driver, 10)

# Iterate over all combinations of brand and year
for brand in brands:
    # Select brand
    brand_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'brand-dropdown')))
    Select(brand_dropdown).select_by_value(brand)

    for year in years:
        # Select year
        year_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'year-dropdown')))
        Select(year_dropdown).select_by_value(year)

        # Wait until model dropdown options populate
        model_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'model-dropdown')))
        model_options = model_dropdown.find_elements(By.TAG_NAME, 'option')
        model_values = [option.get_attribute('value') for option in model_options if option.get_attribute('value')]

        # Iterate over each model option
        for model_value in model_values:
            # Select model
            Select(model_dropdown).select_by_value(model_value)

            # Wait and check if car info is displayed
            try:
                car_info_div = wait.until(EC.presence_of_element_located((By.ID, 'car-info')))
                
                # Wait explicitly for "No Car Data Available" or other data to load
                WebDriverWait(driver, 5).until(
                    lambda d: car_info_div.text != ""  # Wait until some data appears
                )

                # Check if "No Car Data Available" message is present
                car_info_text = car_info_div.text
                if "No Car Data Available" in car_info_text:
                    # Append missing data to results
                    missing_data = {
                        "brand": brand,
                        "year": year,
                        "model": model_value,
                        "status": "No Car Data Available"
                    }
                    results.append(missing_data)

            except Exception as e:
                # Handle cases where the data might not load at all
                print(f"Error fetching data for {brand}, {year}, model {model_value}: {e}")
                missing_data = {
                    "brand": brand,
                    "year": year,
                    "model": model_value,
                    "status": "No response or timeout"
                }
                results.append(missing_data)

# Save results to JSON file
with open('vehicle_data.json', 'w') as json_file:
    json.dump(results, json_file, indent=2)

# Close the WebDriver
driver.quit()
