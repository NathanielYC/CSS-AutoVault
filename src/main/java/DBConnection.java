import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    // Method to create a connection to MySQL
    // Don't think we need this cuz of Lambda?
    // Just random method for now if we need it
    public Connection createConnection() throws SQLException {
        String jdbcUrl = "jdbc:mysql://database-2.cp6y8k80ib5l.us-east-1.rds.amazonaws.com:3306/database-2s";

        return DriverManager.getConnection(jdbcUrl);
    }
}
