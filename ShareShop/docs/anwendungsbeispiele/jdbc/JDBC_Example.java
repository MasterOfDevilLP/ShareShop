import java.sql.*;
import java.util.HashMap;
import java.util.Map;

import com.microsoft.sqlserver.jdbc.*;
/*
wichtig: das Beispiel nutzt statt PostgreSQL MSSQL
um als testdatenbank die Datenbank aus dem Modul Datenbanksysteme I und II
nutzen zu können!
Dabei ändert sich lediglich die verlinkung zum Datenbankserver, die API bleibt dabei identisch
*/

/*
informationen zu den beispielen sind aus den mitgelieferten code beispielen vom MSSQL JDBC Treiber package entnommen
https://learn.microsoft.com/en-us/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server
*/
public class JDBC_Example
{
    private static final String HOST = "141.56.2.45";
    private static final String PORT = "1433";
    private static final String DBNAME = "ii23s86423";
    private static final String username = "s86423";
    private static final String password = "s86423";

/*
damit im include in der dokumentation die indentations nicht kacke aussehebn (da ich die class definition weglasse)
sind hier die funktionen einen weniger eingerückt
*/

//tag::createConnection()[]
private static Connection conn;

public static Connection createConnection(String url, String username, String password) throws SQLException
{
    return DriverManager.getConnection(url, username, password); // establish connection
}

public static void exampleCreateConnection() throws Exception
{
    String url = new String("jdbc:sqlserver://" +
                            HOST + ":" + PORT + ";" +
                            "databaseName=" + DBNAME + ";" +
                            "encrypt=true;" +
                            "trustServerCertificate=true;");
    try
    {
        conn = createConnection(url, username, password);   // conn is an object from class 'Connection' -> close connection with conn.close() 
    } catch (SQLException e)
    {
        System.err.println("Fehler beim aufbauen der Verbindung zum DB-Server: " + e.getMessage());
    }
}
//end::createConnection()[]

//tag::exampleQuery()[]
public static void exampleQuery()
{
    try
    {
        Statement stmt = conn.createStatement();
        String SQL = "SELECT * FROM dbo.Auftrag";
        ResultSet rs = stmt.executeQuery(SQL);

        while (rs.next())
        {
            System.out.println(rs.getString("Aufnr") + " " 
                + rs.getString("MitID") + " " 
                + rs.getString("KunNr") + " " 
                + rs.getString("AufDat") + " " 
                + rs.getString("ErlDat") + " " 
                + rs.getString("Dauer") + " " 
                + rs.getString("Anfahrt") + " "
                + rs.getString("Beschreibung"));
        }
        stmt.close(); // also closes the ResultSet object created by the Statement
    } catch (SQLException e) // handle any errors that may occur
    {
        e.printStackTrace();
    }


}
//end::exampleQuery()[]

//tag::exampleParameterQuery()[]
public static void exampleParameterQuery(HashMap<String, Integer> salesForWeek) throws SQLException
{
    String updateString = "UPDATE coffees SET sales = ? WHERE cof_name = ?";
    String updateStatement = "UPDATE coffees SET total = total + ? WHERE cof_name = ?";
    try (   PreparedStatement updateSales = conn.prepareStatement(updateString);
            PreparedStatement updateTotal = conn.prepareStatement(updateStatement))
    {
        conn.setAutoCommit(false); // only full changes should be committed
        for (Map.Entry<String, Integer> e : salesForWeek.entrySet())
        {
            updateSales.setInt(1, e.getValue().intValue()); // index starts at 1 (why ever)
            updateSales.setString(2, e.getKey());
            updateSales.executeUpdate();

            updateTotal.setInt(1, e.getValue().intValue());
            updateTotal.setString(2, e.getKey());
            updateTotal.executeUpdate();
            
            conn.commit(); // changes get committed
        }
    } catch (SQLException e) // Exception handling
    {
        System.err.println(e.getMessage());
        if (conn != null)
        {
            try
            {
                System.err.println("Transaction failed, rolling back...");
                conn.rollback();
            } catch (SQLException excep)
            {
                System.err.println(excep.getMessage());
                excep.printStackTrace();
            }
        }
    }
}
//end::exampleParameterQuery()[]

    public static void main(String[] args) throws Exception
    {
        try
        {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (ClassNotFoundException e)
        {
            e.printStackTrace();
            return;
        }
        exampleCreateConnection();
        exampleQuery();
        conn.close(); // closes the connection to the Database Server
    }
}