package shareshop;

import shareshop.Manager.UserManager;
import shareshop.Manager.WGManager;

public class AppContext {
	// just a class that holds references to all the Managers
	public UserManager userManager;
	public WGManager wgManager;
	public Config config;
	
	public AppContext(UserManager userManager, WGManager wgManager, Config config) {
		this.userManager = userManager;
		this.wgManager = wgManager;
		this.config = config;
	}
}
