import pymysql
import json

#Lambda function to return data from API

# MySQL RDS connection details
# Needs to be fixed changed cant be hardcoded
RDS_HOST = 'database-2.cp6y8k80ib5l.us-east-1.rds.amazonaws.com'
RDS_USER = 'admin'
RDS_PASSWORD = '123asdzxc'
RDS_DB = 'Cars'

def lambda_handler(event, context):
    # Extract parameters from the query string
    #What needs to go into API
    params = event.get('queryStringParameters') or {}
    brand = params.get('carbrand', '').capitalize()
    year = params.get('modelyear', '')



    # Validate both brand and year are provided
    if not brand or not year:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Both carbrand and modelyear are required.'})
        }
    
    # Connect to the database
    connection = pymysql.connect(
        host=RDS_HOST,
        user=RDS_USER,
        password=RDS_PASSWORD,
        db=RDS_DB
    )
    
    try:
        with connection.cursor() as cursor:
            query = """
                SELECT ModelID, ModelName, ModelYear, CarBrand 
                FROM vehicle_information
                WHERE CarBrand = %s AND ModelYear = %s
            """
            cursor.execute(query, (brand, year))
            car_data = cursor.fetchall()
            
            # Format the result as a list of dictionaries
            result = [
                {
                    'ModelID': row[0],
                    'ModelName': row[1],
                    'ModelYear': row[2],
                    'CarBrand': row[3]
                }
                for row in car_data
            ]
            
        # Return the result
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    
    except Exception as e:
        print(f"Database error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        connection.close()
