package shareshop.rest;

import io.javalin.Javalin;
import io.javalin.http.HttpStatus;

public class CategoryEndpoints {
	
	private final static String basepath = "/wg/{wid}/category";
	
	public static void register(Javalin app) {
		registerPost(app);
		registerDelete(app);
		registerPatch(app);
	}
	
	
	private static void registerDelete(Javalin app) {
		app.delete(basepath + "/{cid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String cid = ctx.pathParam("cid");
			
			System.out.printf("WG %s delete category %s\n", wid, cid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerPatch(Javalin app) {
		app.patch(basepath + "/{cid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String cid = ctx.pathParam("cid");
			
			System.out.printf("WG %s patch category %s\n", wid, cid);
			
			// TODO: Request object (will likely just be the category class again)
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerPost(Javalin app) {
		app.post(basepath, ctx -> {
			String wid = ctx.pathParam("wid");
			System.out.printf("WG %s add category\n", wid);
			
			// TODO: Request object (will likely just be the category class?)
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
}
