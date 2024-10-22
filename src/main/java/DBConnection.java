import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    // Method to create a connection to MySQL
    public Connection createConnection() throws SQLException {
        String jdbcUrl = "jdbc:mysql://database-2.cp6y8k80ib5l.us-east-1.rds.amazonaws.com:3306/database-2s";
        String username = "admin";
        String password = "123asdzxc";
        return DriverManager.getConnection(jdbcUrl, username, password);
    }
}
