package shareshop;

import shareshop.Manager.ItemManager;
import shareshop.Manager.UserManager;
import shareshop.Manager.WGManager;

public class AppContext {
	// just a class that holds references to all the Managers
	public UserManager userManager;
	public WGManager wgManager;
	public ItemManager itemManager;
	public Config config;
	public DBConnectionHandler conn;	// slist needs this
	
	public AppContext(UserManager userManager, WGManager wgManager, ItemManager itemManager, DBConnectionHandler conn, Config config) {
		this.userManager = userManager;
		this.wgManager = wgManager;
		this.itemManager = itemManager;
		this.conn = conn;
		this.config = config;
	}
}
