package shareshop;

/**
 * A class where the config data is stored in
 */
public class Config {
    private DatabaseConfig DatabaseConfig;
    /**
     * Database configs
     */
    public class DatabaseConfig{
        public String user;
        public String password;
        public String server;
        public int port;
        public int max_connection_tries;
    }

    public DatabaseConfig getDBConfig() {return this.DatabaseConfig;}
}
