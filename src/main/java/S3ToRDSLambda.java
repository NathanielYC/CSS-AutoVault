import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.S3Event;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class S3ToRDSLambda implements RequestHandler<S3Event, String> {

    // Single S3 Client instance
    private static final AmazonS3 s3Client = AmazonS3ClientBuilder.standard().build();

    @Override
    public String handleRequest(S3Event s3event, Context context) {
        String bucketName = s3event.getRecords().get(0).getS3().getBucket().getName();
        String key = s3event.getRecords().get(0).getS3().getObject().getKey();
        String rdsProxyUrl = "jdbc:mysql://database-2.cp6y8k80ib5l.us-east-1.rds.amazonaws.com:3306/Cars?useSSL=true";

        try {
            // Read XML file from S3
            String xmlContent = getS3Object(bucketName, key);

            // Parse XML (simple string manipulation example)
            int makeID = Integer.parseInt(extractTagValue(xmlContent, "MakeID"));
            String makeName = extractTagValue(xmlContent, "MakeName");
            int modelID = Integer.parseInt(extractTagValue(xmlContent, "ModelID"));
            String modelName = extractTagValue(xmlContent, "ModelName");
            int modelYear = Integer.parseInt(extractTagValue(xmlContent, "ModelYear"));

            // Insert data into RDS
            insertIntoRds(rdsProxyUrl, makeID, makeName, modelID, modelName, modelYear);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return "Error";
        }
        return "Success";
    }

    // Function to get object content from S3
    private String getS3Object(String bucketName, String key) throws Exception {
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(s3Client.getObject(bucketName, key).getObjectContent())
        );
        StringBuilder content = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            content.append(line);
        }
        return content.toString();
    }

    // Simple string-based XML parsing function
    private String extractTagValue(String xml, String tagName) {
        String startTag = "<" + tagName + ">";
        String endTag = "</" + tagName + ">";
        int start = xml.indexOf(startTag) + startTag.length();
        int end = xml.indexOf(endTag);
        return xml.substring(start, end);
    }

    // Insert data into RDS using plain SQL and RDS Proxy
    private void insertIntoRds(String rdsProxyUrl, int makeID, String makeName, int modelID, String modelName, int modelYear) throws Exception {
        Connection conn = DriverManager.getConnection(rdsProxyUrl, "username", "password");

        // Insert into vehicle_dealers
        String insertDealerSQL = "INSERT INTO vehicle_dealers (MakeID, MakeName) VALUES (?, ?) " +
                "ON DUPLICATE KEY UPDATE MakeName = VALUES(MakeName)";
        PreparedStatement pstmtDealers = conn.prepareStatement(insertDealerSQL);
        pstmtDealers.setInt(1, makeID);
        pstmtDealers.setString(2, makeName);
        pstmtDealers.executeUpdate();
        pstmtDealers.close();

        // Insert into vehicle_information
        String insertVehicleSQL = "INSERT INTO vehicle_information (ModelID, ModelName, ModelYear, MakeID) VALUES (?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE ModelName = VALUES(ModelName), ModelYear = VALUES(ModelYear)";
        PreparedStatement pstmtVehicle = conn.prepareStatement(insertVehicleSQL);
        pstmtVehicle.setInt(1, modelID);
        pstmtVehicle.setString(2, modelName);
        pstmtVehicle.setInt(3, modelYear);
        pstmtVehicle.setInt(4, makeID);
        pstmtVehicle.executeUpdate();
        pstmtVehicle.close();

        conn.close();
    }
}
