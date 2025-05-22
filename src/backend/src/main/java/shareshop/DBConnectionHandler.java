package shareshop;

import java.sql.*;
import java.util.Properties;

import shareshop.Config.DatabaseConfig;

/**
 * handler for the connection to the database
 */
public class DBConnectionHandler {
    private String user;
    private String pwd;
    private String server;
    private int port;
    private int MAX_CONNECTION_TRIES;
    public Connection conn;

    /**
     * Constructor of class DBConnectionHandler
     * @param config
     */
    public DBConnectionHandler(DatabaseConfig config) {
        this.user = config.user;
        this.pwd = config.password;
        this.server = config.server;
        this.port = config.port;
        this.MAX_CONNECTION_TRIES = config.max_connection_tries;
    }

    /**
     * Establishes a connection to the database
     * @throws SQLException
     */
    public void open() throws SQLException {
        String url = new String("jdbc:postgresql://" + this.server + ":" + this.port + "/ShareShopTestDB");
        Properties props = new Properties();
        props.setProperty("user", this.user);
        props.setProperty("password", this.pwd);
        props.setProperty("ssl", "false");
        int connectionTries = 0;
        while (connectionTries < this.MAX_CONNECTION_TRIES) {
            try {
                connectionTries++;
                this.conn = DriverManager.getConnection(url, props);
            } catch (SQLException e) {
                if (connectionTries >= this.MAX_CONNECTION_TRIES) {
                    throw e;
                } else {
                    continue;
                }
            }
        }
    }

    /**
     * closes the connection to the databse, if a connection is open
     */
    public void close() {
        try {
            if (!this.conn.isClosed()) {
                this.conn.close();
            }
        } catch (SQLException e)
        {
            System.err.println(e.getMessage());
            e.printStackTrace();
        }

    }

    /**
     * makes sure the connection is open (if it got closed it will reopen it)
     * @throws SQLException
     */
    public void makeSureItsOpen() throws SQLException {
        if (!this.conn.isClosed()) {
            return;
        } else {
            this.open();
        }
    }
}
