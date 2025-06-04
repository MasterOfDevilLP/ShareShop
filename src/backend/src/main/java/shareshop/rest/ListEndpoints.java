package shareshop.rest;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.http.ContentType;
import io.javalin.http.HttpStatus;
import shareshop.rest.requests.CreateListRequest;

public class ListEndpoints {
	
	private final static String basepath = "/wg/{wid}/list";
	
	public static void register(Javalin app) {
		registerCreate(app);
		registerGet(app);
		registerPost(app);
		registerDelete(app);
		registerGetAudit(app);
	}
	
	private static void registerCreate(Javalin app) {
		app.post(basepath, ctx -> {
			String wid = ctx.pathParam("wid");
			try {
				Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
				CreateListRequest req = gson.fromJson(ctx.body(), CreateListRequest.class);
				if(!req.validate()) {
					ctx.status(HttpStatus.BAD_REQUEST);
					return;
				}
				
				// TODO: proper functionality
				System.out.println(String.format("Created list %s for WG %s", req.name, wid));
				ctx.contentType(ContentType.JSON);
				ctx.result(String.format("{\"id\":\"%s\"}", "59813uuid"));
				ctx.status(HttpStatus.OK);
			} catch(Exception e) {
				e.printStackTrace();
				ctx.status(400);
			}
			
		});
	}
	
	private static void registerGet(Javalin app) {
		app.get(basepath + "/{lid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String lid = ctx.pathParam("lid");
			System.out.printf("Get WG %s list %s\n", wid, lid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerPost(Javalin app) {
		app.post(basepath + "/{lid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String lid = ctx.pathParam("lid");
			System.out.printf("WG %s list %s post change\n", wid, lid);
			
			// TODO: Request object
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerDelete(Javalin app) {
		app.delete(basepath + "/{lid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String lid = ctx.pathParam("lid");
			System.out.printf("Delete WG %s list %s\n", wid, lid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerGetAudit(Javalin app) {
		app.get(basepath + "/{lid}/audit", ctx -> {
			String wid = ctx.pathParam("wid");
			String lid = ctx.pathParam("lid");
			System.out.printf("Get WG %s list %s Audit log\n", wid, lid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}

}
