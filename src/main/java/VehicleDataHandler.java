import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class VehicleDataHandler implements RequestHandler<Object, String> {

    @Override
    public String handleRequest(Object input, Context context) {
        String[] years = {"2020", "2021", "2022", "2023", "2024"};
        String basePath = "/path/to/your/xml/file/";

        try {
            for (String year : years) {
                // Parse and insert data for each year
                String xmlFilePath = basePath + year + ".xml";  // Assuming XML files are named by year
                XMLParser parser = new XMLParser();
                parser.parseAndInsertData(xmlFilePath, Integer.parseInt(year));
            }
        } catch (Exception e) {
            context.getLogger().log("Error processing: " + e.getMessage());
            return "Failed";
        }

        return "Success";
    }
}
