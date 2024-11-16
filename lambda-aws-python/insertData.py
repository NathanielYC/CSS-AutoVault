import pymysql
import json
import os

# RDS settings
rds_host = os.environ['RDS_HOST']
rds_user = os.environ['RDS_USER']
rds_password = os.environ['RDS_PASSWORD']
rds_db = os.environ['RDS_DB']

# Establish a connection to the RDS database
def get_db_connection():
    return pymysql.connect(
        host=rds_host,
        user=rds_user,
        password=rds_password,
        database=rds_db,
        cursorclass=pymysql.cursors.DictCursor,
    )

def lambda_handler(event, context):
    print("Full event received:", json.dumps(event))  # Log full event for debugging

    # Parse the event body
    data = json.loads(event['body'])

    model_id = data.get('ModelID')
    model_name = data.get('ModelName')
    model_year = data.get('ModelYear')
    car_brand = data.get('CarBrand')

    if not all([model_id, model_name, model_year, car_brand]):
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins, or specify a specific domain
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',  # Allowed methods
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'  # Allowed headers
            },
            'body': json.dumps({'error': 'One or more required fields are missing'})
        }

    # SQL Insert query
    insert_query = """
        INSERT INTO vehicle_information (ModelID, ModelName, ModelYear, CarBrand)
        VALUES (%s, %s, %s, %s)
    """

    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(insert_query, (model_id, model_name, model_year, car_brand))
        connection.commit()

        # Return the inserted vehicle data
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins, or specify a specific domain
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',  # Allowed methods
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'  # Allowed headers
            },
            'body': json.dumps({
                'message': 'Vehicle information inserted successfully',
                'modelID': model_id,
                'modelName': model_name,
                'modelYear': model_year,
                'carBrand': car_brand
            })
        }

    except Exception as e:
        print(f"Error during insert: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',  # Allowed methods
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'  # Allowed headers
            },
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        if connection:
            connection.close()
