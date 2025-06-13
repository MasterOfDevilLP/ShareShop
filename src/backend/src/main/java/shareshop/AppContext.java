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
	
	public AppContext(UserManager userManager, WGManager wgManager, ItemManager itemManager, Config config) {
		this.userManager = userManager;
		this.wgManager = wgManager;
		this.itemManager = itemManager;
		this.config = config;
	}
}
