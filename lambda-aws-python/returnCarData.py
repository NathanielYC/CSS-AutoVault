import pymysql
import json

# Hardcoded RDS details (replace with environment variables for production)
RDS_HOST = 'database-2.cp6y8k80ib5l.us-east-1.rds.amazonaws.com'
RDS_USER = 'admin'
RDS_PASSWORD = '123asdzxc'
RDS_DB = 'Cars'

def lambda_handler(event, context):
    # Temporarily hardcode the brand and year for testing
    brand = 'FORD'
    year = '2022'
    
    # Connect to the RDS MySQL database
    connection = pymysql.connect(
        host=RDS_HOST,
        user=RDS_USER,
        password=RDS_PASSWORD,
        db=RDS_DB
    )
    
    try:
        with connection.cursor() as cursor:
            # Query to get the car models based on brand and year
            query = """
                SELECT DISTINCT vi.ModelName 
                FROM vehicle_information vi 
                JOIN vehicle_dealers vd ON vd.MakeName = %s
                WHERE vi.ModelYear = %s
            """
            cursor.execute(query, (brand, year))
            models = [row[0] for row in cursor.fetchall()]
            
        # Return the car models
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(models)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        connection.close()
