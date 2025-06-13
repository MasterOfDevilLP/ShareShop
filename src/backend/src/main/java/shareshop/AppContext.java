package shareshop;

import shareshop.Manager.UserManager;

public class AppContext {
	// just a class that holds references to all the Managers
	public UserManager userManager;
	public Config config;
	
	public AppContext(UserManager userManager, Config config) {
		this.userManager = userManager;
		this.config = config;
	}
}
