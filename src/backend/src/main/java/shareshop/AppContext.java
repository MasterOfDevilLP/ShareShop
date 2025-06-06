package shareshop;

import shareshop.Manager.UserManager;

public class AppContext {
	// just a class that holds references to all the Managers
	public UserManager userManager;
	
	public AppContext(UserManager userManager) {
		this.userManager = userManager;
	}
}
