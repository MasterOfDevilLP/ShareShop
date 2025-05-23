package shareshop.rest;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.http.ContentType;
import io.javalin.http.HttpStatus;
import shareshop.rest.requests.CreateWGRequest;
import shareshop.rest.requests.WGAddUserRequest;

public class WGEndpoints {
	
	private final static String basepath = "/wg";
	
	public static void register(Javalin app) {
		registerCreate(app);
		registerGet(app);
		registerDelete(app);
		registerPatch(app);
		
		// WG Users
		registerGetUsers(app);
		registerWGAddUser(app);
		registerGetUser(app);
		registerDeleteUser(app);
		
		registerGetLists(app);
	}
	
	private static void registerCreate(Javalin app) {
		app.post(basepath + "/create", ctx -> {
			
			try {
				Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
				CreateWGRequest req = gson.fromJson(ctx.body(), CreateWGRequest.class);
				if(!req.validate()) {
					ctx.status(HttpStatus.BAD_REQUEST);
					return;
				}
				
				// TODO: proper functionality
				System.out.println(String.format("Created wg %s", req.name));
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
		app.get(basepath + "/{wid}", ctx -> {
			String wid = ctx.pathParam("wid");
			System.out.printf("Get WG %s\n", wid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerDelete(Javalin app) {
		app.delete(basepath + "/{wid}", ctx -> {
			String wid = ctx.pathParam("wid");
			System.out.printf("Delete WG %s\n", wid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerPatch(Javalin app) {
		app.patch(basepath + "/{wid}", ctx -> {
			String wid = ctx.pathParam("wid");
			System.out.printf("Patch WG %s\n", wid);
			
			// TODO: the request body for this will probably use the regular WG class
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	// WG User endpoints
	
	private static void registerGetUsers(Javalin app) {
		app.get(basepath + "/{wid}/user", ctx -> {
			String wid = ctx.pathParam("wid");
			System.out.printf("Get WG %s users\n", wid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerWGAddUser(Javalin app) {
		app.post(basepath + "/{wid}/user", ctx -> {
			String wid = ctx.pathParam("wid");
			try {
				Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
				WGAddUserRequest req = gson.fromJson(ctx.body(), WGAddUserRequest.class);
				if(!req.validate()) {
					ctx.status(HttpStatus.BAD_REQUEST);
					return;
				}
				
				// TODO: Authorisation
				// TODO: proper functionality
				System.out.println(String.format("Add user %s to WG %s", req.id, wid));
				ctx.status(HttpStatus.UNAUTHORIZED);
			} catch(Exception e) {
				e.printStackTrace();
				ctx.status(400);
			}
			
		});
	}
	
	// single user endpoints
	
	private static void registerGetUser(Javalin app) {
		app.get(basepath + "/{wid}/user/{uid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String uid = ctx.pathParam("uid");
			System.out.printf("Get WG %s user %s\n", wid, uid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerDeleteUser(Javalin app) {
		app.delete(basepath + "/{wid}/user/{uid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String uid = ctx.pathParam("uid");
			System.out.printf("Remove WG %s user %s\n", wid, uid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerGetLists(Javalin app) {
		app.get(basepath + "/{wid}/list", ctx -> {
			String wid = ctx.pathParam("wid");
			System.out.printf("Get WG %s lists\n", wid);
			
			// TODO: functionality
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
}
