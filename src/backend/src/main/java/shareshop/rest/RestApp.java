package shareshop.rest;

import io.javalin.Javalin;

public class RestApp {
	private Javalin app;
	public RestApp(String host, int port) {
		app = Javalin.create();
		
		// Register Endpoints
		// these could be static too, probably nicer that way
		UsersEndpoints.register(app);
		
		app.start(host, port);
	}
	
	public void stop() {
		app.stop();
	}
}
