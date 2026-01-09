package shareshop;

/**
 * A class where the config data is stored in (directly deserialized from json)
 */
public class Config {
    private DatabaseConfig DatabaseConfig;
    /**
     * Database configs
     */
    public class DatabaseConfig{
    	/**
    	 * Username for the db
    	 */
        public String user;
        /**
         * Password for the db
         */
        public String password;
        /**
         * The db server to use
         */
        public String server;
        /**
         * The port to connect to
         */
        public int port;
        /**
         * How many times to retry connecting to the db in case of failure
         */
        public int max_connection_tries;
    }
    
    /**
     * The port for the webserver to listen on (REST API)
     */
    public int webPort;
    /**
     * The host for the webserver to bind to
     */
    public String webHost;
    /**
     * Whether or not all hosts should be allowed to make cross-origin requests 
     * (if enabled, the Acces-Control-Allow-Origin header will reflect the origin the request came from).
     * Useful for testing, do not use in production unless you know what you are doing.
     */
    public boolean corsAllowAll;
    
    /**
     * Get the database connection configuration
     * @return The DatabaseConfig
     */
    public DatabaseConfig getDBConfig() {return this.DatabaseConfig;}
}
