import pymysql
import json
import os

# RDS settings
rds_host = os.environ['RDS_HOST']
rds_user = os.environ['RDS_USER']
rds_password = os.environ['RDS_PASSWORD']
rds_db = os.environ['RDS_DB']

def get_db_connection():
    return pymysql.connect(
        host=rds_host,
        user=rds_user,
        password=rds_password,
        database=rds_db,
        cursorclass=pymysql.cursors.DictCursor,
    )

def lambda_handler(event, context):
    print("Deleting a vehicle...")

    connection = None  # Initialize connection

    try:
        # Ensure 'body' exists in the event
        if 'body' not in event or not event['body']:
            raise ValueError("Request body is missing")

        # Parse the request body
        if isinstance(event['body'], str):
            body = json.loads(event['body'])
        else:
            body = event['body']

        print("Parsed body:", body)
        model_id = body.get('ModelID')
        model_year = body.get('ModelYear')
        car_brand = body.get('CarBrand')
        model_name = body.get('ModelName')

        print(f"ModelID: {model_id}, ModelYear: {model_year}, CarBrand: {car_brand}, ModelName: {model_name}")

        # Explicitly validate all required fields
        if model_id is None or not model_year or not car_brand or not model_name:
            raise ValueError("ModelID, ModelYear, CarBrand, and ModelName are required")

        # SQL query to delete a single row
        query = """
        DELETE FROM vehicle_information
        WHERE ModelID = %s AND ModelYear = %s AND CarBrand = %s AND ModelName = %s
        """

        # Establish the database connection
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(query, (model_id, model_year, car_brand, model_name))
        connection.commit()

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
            },
            'body': json.dumps({'message': f'Vehicle with ModelID {model_id}, ModelYear {model_year}, CarBrand {car_brand}, and ModelName {model_name} deleted successfully'})
        }

    except ValueError as ve:
        # Handle missing fields or body errors
        error_message = f"ValueError: {str(ve)}"
        print(error_message)
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
            },
            'body': json.dumps({'error': error_message})
        }

    except Exception as e:
        # Handle unexpected exceptions
        error_message = f"Error deleting vehicle: {str(e)}"
        print(error_message)
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
            },
            'body': json.dumps({'error': error_message})
        }

    finally:
        # Ensure the connection is closed
        if connection:
            connection.close()
