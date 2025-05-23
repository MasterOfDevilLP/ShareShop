package shareshop.rest;

import io.javalin.Javalin;
import io.javalin.http.HttpStatus;

public class ItemEndpoints {
	
	private final static String basepath = "/wg/{wid}/item";
	
	public static void register(Javalin app) {
		registerGet(app);
		registerGetItem(app);
		registerPost(app);
		registerDelete(app);
		registerPatch(app);
	}
	
	private static void registerGet(Javalin app) {
		app.get(basepath, ctx -> {
			String wid = ctx.pathParam("wid");
			
			// search parameters
			String category = ctx.queryParam("category");
			String iid = ctx.queryParam("iid");
			String query = ctx.queryParam("q");
			System.out.printf("WG %s item search query: %s iid: %s category: %s\n", wid, query, iid, category);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerGetItem(Javalin app) {
		app.get(basepath + "/{iid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String iid = ctx.pathParam("iid");
			
			System.out.printf("WG %s get item %s\n", wid, iid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerDelete(Javalin app) {
		app.delete(basepath + "/{iid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String iid = ctx.pathParam("iid");
			
			System.out.printf("WG %s delete item %s\n", wid, iid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerPatch(Javalin app) {
		app.patch(basepath + "/{iid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String iid = ctx.pathParam("iid");
			
			System.out.printf("WG %s patch item %s\n", wid, iid);
			
			// TODO: Request object (will likely just be the item class)
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerPost(Javalin app) {
		app.post(basepath, ctx -> {
			String wid = ctx.pathParam("wid");
			System.out.printf("WG %s add item\n", wid);
			
			// TODO: Request object (will likely just be the item class)
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
}
