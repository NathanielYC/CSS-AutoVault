import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class XMLParser {

    // Method to parse XML and insert into MySQL
    public void parseAndInsertData(String filePath, int modelYear) throws Exception {
        // Create connection to MySQL DB
        DBConnection dbConnection = new DBConnection();
        Connection connection = dbConnection.createConnection();

        // Parse XML file
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document document = builder.parse(filePath);

        NodeList makeModelsList = document.getElementsByTagName("MakeModels");

        for (int i = 0; i < makeModelsList.getLength(); i++) {
            Element makeModel = (Element) makeModelsList.item(i);

            String makeID = makeModel.getElementsByTagName("Make_ID").item(0).getTextContent();
            String makeName = makeModel.getElementsByTagName("Make_Name").item(0).getTextContent();
            String modelID = makeModel.getElementsByTagName("Model_ID").item(0).getTextContent();
            String modelName = makeModel.getElementsByTagName("Model_Name").item(0).getTextContent();

            // Insert into vehicle_dealers
            insertIntoDealers(connection, makeID, makeName);

            // Insert into vehicle_information
            insertIntoInformation(connection, modelID, modelName, makeID, modelYear);
        }

        connection.close();
    }

    // Method to insert into vehicle_dealers
    private void insertIntoDealers(Connection connection, String makeID, String makeName) throws SQLException {
        String query = "INSERT INTO vehicle_dealers (MakeID, MakeName) VALUES (?, ?) " +
                "ON DUPLICATE KEY UPDATE MakeName = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setInt(1, Integer.parseInt(makeID));
        statement.setString(2, makeName);
        statement.setString(3, makeName);
        statement.executeUpdate();
    }

    // Method to insert into vehicle_information
    private void insertIntoInformation(Connection connection, String modelID, String modelName, String makeID, int modelYear) throws SQLException {
        String query = "INSERT INTO vehicle_information (ModelID, ModelName, ModelYear, MakeID) VALUES (?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE ModelName = VALUES(ModelName), ModelYear = VALUES(ModelYear)";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setInt(1, Integer.parseInt(modelID));
        statement.setString(2, modelName);
        statement.setInt(3, modelYear);
        statement.setInt(4, Integer.parseInt(makeID));
        statement.executeUpdate();
    }
}
