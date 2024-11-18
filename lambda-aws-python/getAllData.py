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
    print("Fetching all vehicles...")

    query = "SELECT * FROM vehicle_information ORDER BY ModelID ASC"

    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,GET',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
            },
            'body': json.dumps(results)
        }
    except Exception as e:
        error_message = f"Error fetching vehicles: {str(e)}"
        print(error_message)
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,GET',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
            },
            'body': json.dumps({'error': error_message})
        }
    finally:
        if connection:
            connection.close()
