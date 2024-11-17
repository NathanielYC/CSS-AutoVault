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
    print("Full event received:", json.dumps(event))  # Log the full event

    # Parse the incoming request
    if 'body' in event:
        data = event['body']
        if isinstance(data, str):
            data = json.loads(data)
    else:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
            },
            'body': json.dumps({'error': 'Missing body in request'})
        }

    # Determine the HTTP method
    method = event.get('httpMethod', '').upper()

    if method == 'DELETE':
        # Extract ModelID for deletion
        model_id = data.get('ModelID')
        if not model_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
                },
                'body': json.dumps({'error': 'ModelID is required for deletion'})
            }

        # SQL Delete query
        delete_query = "DELETE FROM vehicle_information WHERE ModelID = %s"

        try:
            connection = get_db_connection()
            with connection.cursor() as cursor:
                cursor.execute(delete_query, (model_id,))
            connection.commit()

            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
                },
                'body': json.dumps({'message': f'Vehicle with ModelID {model_id} deleted successfully'})
            }
        except Exception as e:
            error_message = f"Database deletion error: {str(e)}"
            print(error_message)
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
                },
                'body': json.dumps({'error': error_message})
            }
        finally:
            if connection:
                connection.close()
    else:
        return {
            'statusCode': 405,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
            },
            'body': json.dumps({'error': f'Method {method} not allowed'})
        }
