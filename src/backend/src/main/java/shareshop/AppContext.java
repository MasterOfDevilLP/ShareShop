package shareshop;

import shareshop.Manager.ItemManager;
import shareshop.Manager.UserManager;
import shareshop.Manager.WGManager;
/**
 * Class which holds references to various objects needed throughout the application.
 * Mostly used within the REST API
 */
public class AppContext {
	// just a class that holds references to all the Managers
	/**
	 * The UserManager used by this instance
	 */
	public UserManager userManager;
	/**
	 * The WGManager used by this instance
	 */
	public WGManager wgManager;
	/**
	 * The ItemManager used by this instance
	 */
	public ItemManager itemManager;
	/**
	 * The configuration that was specified
	 */
	public Config config;
	/**
	 * Connection handler for the database. Needed to retrieve some things
	 */
	public DBConnectionHandler conn;	// slist needs this
	
	/**
	 * Just sets all the member fields in this class, nothing more
	 * @param userManager UserManager to use
	 * @param wgManager WGManager to use
	 * @param itemManager ItemManager to use
	 * @param conn DBConnectionHandler to use
	 * @param config Config to use
	 */
	public AppContext(UserManager userManager, WGManager wgManager, ItemManager itemManager, DBConnectionHandler conn, Config config) {
		this.userManager = userManager;
		this.wgManager = wgManager;
		this.itemManager = itemManager;
		this.conn = conn;
		this.config = config;
	}
}
