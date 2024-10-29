import boto3
import pymysql
import xml.etree.ElementTree as ET
import re
import os

# Initialize boto3 S3 client
s3 = boto3.client('s3')

def lambda_handler(event, context):
    bucket = 'cleanxmldata'
    keys = [
        'Ford/cleaned_ford_2020.xml',
        'Ford/cleaned_ford_2021.xml',
        'Ford/cleaned_ford_2022.xml',
        'Ford/cleaned_ford_2023.xml'
    ]

    # Connect to MySQL RDS
    connection = pymysql.connect(
        host='database-2.cp6y8k80ib5l.us-east-1.rds.amazonaws.com',
        user='admin',
        password='123asdzxc',
        database='Cars',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with connection.cursor() as cursor:
            for key in keys:
                # Extract model year from the file name
                match = re.search(r'(\d{4})', key)
                model_year = int(match.group(1)) if match else 9999  # Fallback year

                # Retrieve the XML file from S3
                response = s3.get_object(Bucket=bucket, Key=key)
                xml_content = response['Body'].read()

                # Parse XML and extract vehicle data
                root = ET.fromstring(xml_content)
                vehicle_data = []

                for make_model in root.findall('MakeModels'):
                    make_name = make_model.find('Make_Name').text  # CarBrand
                    model_id = make_model.find('Model_ID').text
                    model_name = make_model.find('Model_Name').text

                    # Append data for insertion
                    vehicle_data.append((model_id, model_name, model_year, make_name))

                # Insert or update data in MySQL
                for model_id, model_name, model_year, make_name in vehicle_data:
                    # Check if the record exists and if CarBrand is NULL
                    check_query = """
                    SELECT COUNT(*) as count, CarBrand FROM vehicle_information 
                    WHERE ModelID = %s AND ModelYear = %s
                    """
                    cursor.execute(check_query, (model_id, model_year))
                    result = cursor.fetchone()

                    if result['count'] == 0:
                        # Insert if record does not exist
                        insert_vehicle_query = """
                        INSERT INTO vehicle_information (ModelID, ModelName, ModelYear, CarBrand)
                        VALUES (%s, %s, %s, %s)
                        """
                        try:
                            cursor.execute(insert_vehicle_query, (model_id, model_name, model_year, make_name))
                        except pymysql.IntegrityError as e:
                            print(f"Duplicate entry for ModelID {model_id} and ModelYear {model_year}: {str(e)}")
                    elif result['CarBrand'] is None:
                        # Update if CarBrand is NULL
                        update_vehicle_query = """
                        UPDATE vehicle_information
                        SET CarBrand = %s
                        WHERE ModelID = %s AND ModelYear = %s
                        """
                        cursor.execute(update_vehicle_query, (make_name, model_id, model_year))

        connection.commit()

    finally:
        connection.close()

    return {
        'statusCode': 200,
        'body': 'Data inserted/updated successfully for all files'
    }
