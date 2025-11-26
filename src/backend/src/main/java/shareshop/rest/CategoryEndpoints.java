package shareshop.rest;

import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class CategoryEndpoints {
	
	private final static String basepath = "/wg/{wid}/category";
	
	public static void register(Javalin app) {
		registerPost(app);
		registerDelete(app);
		registerPatch(app);
	}
	
	
	public static void epDelete(Context ctx) {
		String wid = ctx.pathParam("wid");
		String cid = ctx.pathParam("cid");
		
		System.out.printf("WG %s delete category %s\n", wid, cid);
		
		// TODO: functionality
		RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
	}
	
	private static void registerDelete(Javalin app) {
		app.delete(basepath + "/{cid}", ctx -> {
			epDelete(ctx);
		});
	}
	
	public static void epPatch(Context ctx) {
		String wid = ctx.pathParam("wid");
		String cid = ctx.pathParam("cid");
		
		System.out.printf("WG %s patch category %s\n", wid, cid);
		
		// TODO: Request object (will likely just be the category class again)
		// TODO: functionality
		RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
	}
	
	private static void registerPatch(Javalin app) {
		app.patch(basepath + "/{cid}", ctx -> {
			epPatch(ctx);
		});
	}
	
	public static void epPost(Context ctx) {
		String wid = ctx.pathParam("wid");
		System.out.printf("WG %s add category\n", wid);
		
		// TODO: Request object (will likely just be the category class?)
		// TODO: functionality
		RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
	}
	
	private static void registerPost(Javalin app) {
		app.post(basepath, ctx -> {
			epPost(ctx);
		});
	}
}
