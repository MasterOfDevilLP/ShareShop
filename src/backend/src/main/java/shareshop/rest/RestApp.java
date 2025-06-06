package shareshop.rest;

import org.jetbrains.annotations.NotNull;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.config.Key;
import io.javalin.json.JsonMapper;
import shareshop.AppContext;

public class RestApp {
	private Javalin app;
	public RestApp(String host, int port, AppContext ctx) {		
		Key ctxKey = new Key<AppContext>("Context");
		app = Javalin.create(config -> {
			config.appData(ctxKey, ctx);
		});
		
		// Register Endpoints
		// these could be static too, probably nicer that way
		UsersEndpoints.register(app);
		WGEndpoints.register(app);
		ListEndpoints.register(app);
		ItemEndpoints.register(app);
		CategoryEndpoints.register(app);
		
		app.start(host, port);
	}
	
	public void stop() {
		app.stop();
	}
}
