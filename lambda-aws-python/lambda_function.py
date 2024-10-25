import boto3
import pymysql
import xml.etree.ElementTree as ET
import re

# Initialize boto3 S3 client
#boto3 allows interaction with AWS services
#Makes it easier to interact with S3, instead of writing out all HTTP requests
s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Hardcoded S3 details for now
    #This needs to be changed to be more dynamic
    #Needs to be triggered by xml file upload or something like that
    bucket = 'cleanxmldata'
    key = 'Ford/cleaned_ford_2022.xml'

    # Extract ModelYear from the file name (e.g., cleaned_dodge_2023.xml)
    #This is so this program can extract all the different years from 2020 to 2025
    match = re.search(r'(\d{4})', key)
    if match:
        model_year = int(match.group(1))
    else:
        model_year = 9999  # Fallback to default if no year is found

    # Retrieve the XML file from S3
    response = s3.get_object(Bucket=bucket, Key=key)
    xml_content = response['Body'].read()

    # Parse the XML file
    root = ET.fromstring(xml_content)

    # Extract relevant data from the XML
    vehicle_data = []
    dealer_data = {}
    
    # Extract Make and Model data
    for make_model in root.findall('MakeModels'):
        make_name = make_model.find('Make_Name').text
        model_id = make_model.find('Model_ID').text
        model_name = make_model.find('Model_Name').text

        # Add to vehicle_data 
        # This is for vehicle_information table in mysql
        vehicle_data.append((model_id, model_name, model_year))

        # Add to dealer_data
        # This is for vehicle_dealers table in mysql
        if make_name not in dealer_data:
            dealer_data[make_name] = make_name

    # Connect to MySQL RDS
    # This might need to be changed?
    # Lambda functions only run in the backend? Thus this is not exposed to the public facing internet?
    connection = pymysql.connect(
        host='database-2.cp6y8k80ib5l.us-east-1.rds.amazonaws.com',
        user='admin',
        password='123asdzxc',
        database='Cars',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            for make_name in dealer_data.keys():
                insert_dealers_query = """
                INSERT INTO vehicle_dealers (MakeName)
                VALUES (%s)
                ON DUPLICATE KEY UPDATE MakeName = VALUES(MakeName)
                """
                cursor.execute(insert_dealers_query, (make_name,))

            # Check for each vehicle if the same ModelID and ModelYear exist
            # Wouldnt allow for duplicates of ModelID even if the year was different
            # This allows for duplicate ModelID as long as ModelYear is not already in mysql
            for model_id, model_name, model_year in vehicle_data:
                check_query = """
                SELECT COUNT(*) as count FROM vehicle_information 
                WHERE ModelID = %s AND ModelYear = %s
                """
                cursor.execute(check_query, (model_id, model_year))
                result = cursor.fetchone()
                
                # If ModelYear is not in database already, insert the data
                if result['count'] == 0:
                    insert_vehicle_query = """
                    INSERT INTO vehicle_information (ModelID, ModelName, ModelYear)
                    VALUES (%s, %s, %s)
                    """
                    try:
                        cursor.execute(insert_vehicle_query, (model_id, model_name, model_year))
                    except pymysql.IntegrityError as e:
                        print(f"Duplicate entry for ModelID {model_id} and ModelYear {model_year}: {str(e)}")

        connection.commit()

    finally:
        connection.close()

    #Terminal output
    return {
        'statusCode': 200,
        'body': 'Data inserted successfully'
    }
