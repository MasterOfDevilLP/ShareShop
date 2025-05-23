package shareshop.rest;

import io.javalin.Javalin;

public class RestApp {
	private Javalin app;
	public RestApp(String host, int port) {
		app = Javalin.create();
		app.start(host, port);
	}
	
	public void stop() {
		app.stop();
	}
}
