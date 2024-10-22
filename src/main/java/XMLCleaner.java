import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.File;
import java.io.StringWriter;
import java.util.HashSet;

public class XMLCleaner {

    // This is to clean the XML files of repeats and random data that is not needed
    // This is probably overkill for the project, but still just good to have just in case
    // There are 4 parameters to change in this code to run code properly for each specific brand
    public void cleanXMLFile(String inputFilePath, String outputFilePath) throws Exception {
        // Parse the original XML file
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document document = builder.parse(new File(inputFilePath));


        // Create a new document to store the filtered results
        Document newDocument = builder.newDocument();
        Element rootElement = newDocument.createElement("Response");
        newDocument.appendChild(rootElement);

        NodeList makeModelsList = document.getElementsByTagName("MakeModels");

        // Set to track seen Model_IDs, make sure there are no repeats of the same models
        HashSet<String> seenModelIDs = new HashSet<>();

        for (int i = 0; i < makeModelsList.getLength(); i++) {
            Element makeModel = (Element) makeModelsList.item(i);

            String makeID = makeModel.getElementsByTagName("Make_ID").item(0).getTextContent();
            String modelID = makeModel.getElementsByTagName("Model_ID").item(0).getTextContent();

            //CHANGE FOR EACH BRAND
            // Only include entries with Make_ID == 460 (Ford)
            //This part needs to be changed depending on what model you want to use
            //Dodge=476
            //Honda=474
            //Mercedes=449
            if (makeID.equals("449") && !seenModelIDs.contains(modelID)) {
                // Add the Model_ID to the set of seen IDs
                seenModelIDs.add(modelID);

                // Import the <MakeModels> element into the new document
                Node newMakeModel = newDocument.importNode(makeModel, true);
                rootElement.appendChild(newMakeModel);
            }
        }

        // Write the new XML to a new file
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        DOMSource source = new DOMSource(newDocument);
        StreamResult result = new StreamResult(new File(outputFilePath));

        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.transform(source, result);

        // Remove both newlines and carriage returns
        //Properly format the xml files, some XML files were being output weird
        StringWriter writer = new StringWriter();
        String cleanedXML = writer.toString().replace("\n", "").replace("\r", "");

        System.out.println("Filtered XML file created: " + outputFilePath);
    }

    // Method to clean multiple XML files for different years with a specific folder and naming convention
    //This part needs to be changed for each specific model name (Dodge, Ford, and so on)
    //Will have to change this to be more dynamic for if we allow CSR to upload files to the backend
    public void cleanMultipleXMLFiles(String baseDirectory, String[] years) {
        try {
            for (String year : years) {

                //CHANGE FOR EACH BRAND
                String inputFilePath = baseDirectory + "/mercedes" + year + ".xml";
                //CHANGE FOR EACH BRAND
                String outputFilePath = "C:\\Web\\Lambda\\src\\CleanXMLFiles\\MercedesBenz" + "/cleaned_mercedes_" + year + ".xml";
                cleanXMLFile(inputFilePath, outputFilePath);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        try {
            XMLCleaner cleaner = new XMLCleaner();

            //CHANGE FOR EACH BRAND
            //Change the directory here too for each brand
            String baseDirectory = "C:/Users/thene/OneDrive - CCSU/Masters/Hartford/nhtsaData/mercedes";  // Directory containing Ford XML files
            String[] years = {"2020", "2021", "2022", "2023", "2024", "2025"};  // List of years to process
            cleaner.cleanMultipleXMLFiles(baseDirectory, years);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
