#This is a test file to test the lambda function
#Do whatever you want with this file
import boto3
import xml.etree.ElementTree as ET
import pymysql
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    logger.info("Function started")

    # Get bucket name and file key from the S3 event
    #bucket = event['Records'][0]['s3']['bucket']['name']
    #key = event['Records'][0]['s3']['object']['key']
    
    bucket = 'cleanxmldata'
    key = '/Dodge/cleaned_dodge_2020.xml'

    logger.info(f"Starting to process file {key} from bucket {bucket}")

    try:
        logger.info(f"Attempting to download the file {key} from bucket {bucket}")
    
        # Download the file from S3
        response = s3_client.get_object(Bucket=bucket, Key=key)
    
        logger.info(f"Successfully downloaded file {key} from bucket {bucket}")
    
        # Read the content of the file
        xml_content = response['Body'].read().decode('utf-8')
        logger.info(f"Successfully read the contents of file {key}")

    except Exception as e:
        logger.error(f"Error occurred while accessing the S3 bucket or reading the file: {str(e)}")
        return {
            'statusCode': 500,
            'body': f"Failed to process file {key} from bucket {bucket}: {str(e)}"
        }


    # Download the file from S3
    response = s3_client.get_object(Bucket=bucket, Key=key)
    xml_content = response['Body'].read().decode('utf-8')
    
    # Parse XML
    root = ET.fromstring(xml_content)
    
    # Connect to RDS
    try:
        conn = pymysql.connect(
            host=os.environ['DB_HOST'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            database=os.environ['DB_NAME']
        )
        logger.info("Connected to database successfully")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return {
            'statusCode': 500,
            'body': f"Database connection failed: {str(e)}"
        }
    
    try:
        with conn.cursor() as cursor:
            # Process vehicle dealers (makes)
            for make in root.findall('.//make'):
                make_name = make.find('name').text
                
                # Check if make already exists
                cursor.execute("SELECT MakeID FROM vehicle_dealers WHERE MakeName = %s", (make_name,))
                result = cursor.fetchone()
                
                if result:
                    make_id = result[0]
                else:
                    # Insert new make
                    cursor.execute("INSERT INTO vehicle_dealers (MakeName) VALUES (%s)", (make_name,))
                    make_id = cursor.lastrowid
                
                logger.info(f"Processed make: {make_name}, ID: {make_id}")
                
                # Process models for this make
                for model in make.findall('.//model'):
                    model_name = model.find('name').text
                    model_year = int(model.find('year').text)
                    
                    # Insert into vehicle_information
                    cursor.execute("""
                        INSERT INTO vehicle_information (ModelName, ModelYear, MakeID)
                        VALUES (%s, %s, %s)
                    """, (model_name, model_year, make_id))
                    
                    logger.info(f"Inserted model: {model_name}, Year: {model_year}, MakeID: {make_id}")
        
        conn.commit()
        logger.info("All data committed to database")
        return {
            'statusCode': 200,
            'body': f"Successfully processed file {key} from bucket {bucket}"
        }
    
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}")
        return {
            'statusCode': 500,
            'body': f"Error processing file {key} from bucket {bucket}: {str(e)}"
        }
    
    finally:
        conn.close()
        logger.info("Database connection closed")