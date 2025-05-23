package shareshop;

import java.sql.SQLException;

import shareshop.rest.RestApp;

/**
 * Main class of shareshop
 */
public class Main {
    /**
     * main function, initializes and runs the whole backend
     * @param args
     */
    public static void main(String[] args) {
        Config config = null;
        try {
            config = new ConfigLoader().loadConfig(args);
        } catch (RuntimeException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
        DBConnectionHandler connectionHandler = new DBConnectionHandler(config.getDBConfig());
        
        try {
            connectionHandler.open();
        } catch (SQLException e)
        {
            System.err.println(e.getMessage());
            e.printStackTrace();
        }
        
        RestApp restApp = new RestApp(config.webHost, config.webPort);
        
        /* put the main loop of the backend here */

        connectionHandler.close();
    }
}