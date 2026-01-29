package shareshop.rest;

import java.io.File;

import org.eclipse.jetty.http.HttpCookie.SameSite;
import org.eclipse.jetty.server.session.CachingSessionDataStore;
import org.eclipse.jetty.server.session.CachingSessionDataStoreFactory;
import org.eclipse.jetty.server.session.DefaultSessionCache;
import org.eclipse.jetty.server.session.FileSessionDataStore;
import org.eclipse.jetty.server.session.NullSessionDataStore;
import org.eclipse.jetty.server.session.NullSessionDataStoreFactory;
import org.eclipse.jetty.server.session.SessionCache;
import org.eclipse.jetty.server.session.SessionHandler;
import org.jetbrains.annotations.NotNull;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.config.Key;
import io.javalin.json.JsonMapper;
import shareshop.AppContext;

/**
 * Main class for the REST application.
 */
public class RestApp {
	private Javalin app;
	/**
	 * Create and start a new instance of the REST application
	 * @param host the address to listen on
	 * @param port the port to listen on
	 * @param ctx the AppContext to pass to endpoint handlers
	 */
	public RestApp(String host, int port, AppContext ctx) {		
		Key ctxKey = new Key<AppContext>("Context");
		app = Javalin.create(config -> {
			config.appData(ctxKey, ctx);
			config.jetty.modifyServletContextHandler(handler -> {
				handler.setSessionHandler(sessionHandler());
			});
			config.bundledPlugins.enableCors(cors -> {
				if(ctx.config.corsAllowAll) {
					cors.addRule(it -> {
						it.reflectClientOrigin = true;
						it.allowCredentials = true;
					});
				}
			});
		});
		
		// Register Endpoints
		// these could be static too, probably nicer that way
		UsersEndpoints.register(app);
		WGEndpoints.register(app);
		ListEndpoints.register(app);
		ItemEndpoints.register(app);
		CategoryEndpoints.register(app);
		InviteEndpoints.register(app);
		
		app.start(host, port);
	}
	
	/**
	 * Stop the REST application
	 */
	public void stop() {
		app.stop();
	}
	
	private static SessionHandler sessionHandler() {
		// data store
		// replace this with a jdbc one
		FileSessionDataStore fsds = new FileSessionDataStore();
		File baseDir = new File(System.getProperty("java.io.tmpdir"));
        File storeDir = new File(baseDir, "javalin-session-store");
        storeDir.mkdir();
        fsds.setStoreDir(storeDir);
		
		SessionHandler shandler = new SessionHandler();
		SessionCache scache = new DefaultSessionCache(shandler);
		shandler.setSessionCache(scache);
		shandler.setHttpOnly(true);	// I don't see a reason to not specify this currently
		shandler.setSameSite(SameSite.NONE);	// TODO: THIS IS VERY BAD! scalar requires this, but this shouldn't be used outside of a development environment
		shandler.getSessionCookieConfig().setSecure(true);	// SSL isn't handled here
		scache.setSessionDataStore(fsds);
		
		return shandler;
	}
}
