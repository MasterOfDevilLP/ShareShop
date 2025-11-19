package shareshop.rest;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.config.Key;
import io.javalin.http.ContentType;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import shareshop.AppContext;
import shareshop.ShoppingList;
import shareshop.User;
import shareshop.WG;
import shareshop.rest.requests.CreateWGRequest;
import shareshop.rest.requests.CreateWGResponse;
import shareshop.rest.requests.ListContentResponse;
import shareshop.rest.requests.PatchWGRequest;
import shareshop.rest.requests.WGAddUserRequest;
import shareshop.rest.requests.WGInformationResponse;

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
	
	public static void epCreate(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		try {
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			CreateWGRequest req = gson.fromJson(ctx.body(), CreateWGRequest.class);
			
			AppContext appCtx = (AppContext) ctx.appData(ctxKey);
			User usr = RestUtils.getAuthorizedUser(ctx);
			
			if(usr == null) {
				// noone's logged in
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
				return;
			}
			
			if(!req.validate()) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
				return;
			}
			
			// either this succeeds, or an exception gets thrown
			WG newWG = appCtx.wgManager.create(usr, req.name);
			
			CreateWGResponse resp = new CreateWGResponse(newWG);
			
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch(Exception e) {
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerCreate(Javalin app) {
		app.post(basepath + "/create", ctx -> {
			epCreate(ctx);
		});
	}
	
	public static void epGet(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		String wid = ctx.pathParam("wid");
		Logger logger = LoggerFactory.getLogger(WGEndpoints.class);
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		
		if(usr == null) {
			// noone's logged in
			logger.debug("no user logged in");
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		UUID wgid = UUID.fromString(wid);
		try {
			if(!usr.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			WG wg = appCtx.wgManager.getWG(UUID.fromString(wid));
			if(wg == null) {
				// no such WG exists, respond with 401 to not leak information about which ones exist and which don't
				logger.debug("no such WG");
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			WGInformationResponse resp = new WGInformationResponse(wg);
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerGet(Javalin app) {
		app.get(basepath + "/{wid}", ctx -> {
			epGet(ctx);
		});
	}
	
	public static void epDelete(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		String wid = ctx.pathParam("wid");
		Logger logger = LoggerFactory.getLogger(WGEndpoints.class);
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		
		if(usr == null) {
			// noone's logged in
			logger.debug("no user logged in");
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		UUID wgid = UUID.fromString(wid);
		try {
			if(!usr.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			WG wg = appCtx.wgManager.getWG(UUID.fromString(wid));
			if(wg == null) {
				// no such WG exists, respond with 401 to not leak information about which ones exist and which don't
				logger.debug("no such WG");
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			// point of (almost) no return
			// TODO: at some point, there should maybe be a permission system
			wg.remove();
			ctx.status(HttpStatus.OK);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerDelete(Javalin app) {
		app.delete(basepath + "/{wid}", ctx -> {
			epDelete(ctx);
		});
	}
	
	public static void epPatch(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		String wid = ctx.pathParam("wid");
		Logger logger = LoggerFactory.getLogger(WGEndpoints.class);
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		
		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		PatchWGRequest req = gson.fromJson(ctx.body(), PatchWGRequest.class);
		
		if(usr == null) {
			// noone's logged in
			logger.debug("no user logged in");
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		if(!req.validate()) {
			RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
			return;
		}
		
		UUID wgid = UUID.fromString(wid);
		try {
			if(!usr.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			WG wg = appCtx.wgManager.getWG(UUID.fromString(wid));
			if(wg == null) {
				// no such WG exists, respond with 401 to not leak information about which ones exist and which don't
				logger.debug("no such WG");
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			// now check whatever needs to be changed (probably more in the future)
			// once permissions are a thing, also check for those
			if(req.name != null) {
				wg.setWgName(req.name);
			}
			
			ctx.status(HttpStatus.OK);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerPatch(Javalin app) {
		app.patch(basepath + "/{wid}", ctx -> {
			epPatch(ctx);
		});
	}
	
	// WG User endpoints
	
	public static void epGetUsers(Context ctx) {
		String wid = ctx.pathParam("wid");
		System.out.printf("Get WG %s users\n", wid);
		
		// TODO: functionality
		RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
	}
	
	private static void registerGetUsers(Javalin app) {
		app.get(basepath + "/{wid}/user", ctx -> {
			epGetUsers(ctx);
		});
	}
	
	public static void epWGAddUser(Context ctx) {
		String wid = ctx.pathParam("wid");
		try {
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			WGAddUserRequest req = gson.fromJson(ctx.body(), WGAddUserRequest.class);
			if(!req.validate()) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
				return;
			}
			
			// TODO: Authorisation
			// TODO: proper functionality
			System.out.println(String.format("Add user %s to WG %s", req.id, wid));
			RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
		} catch(Exception e) {
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerWGAddUser(Javalin app) {
		app.post(basepath + "/{wid}/user", ctx -> {
			epWGAddUser(ctx);	
		});
	}
	
	// single user endpoints
	
	public static void epGetUser(Context ctx) {
		String wid = ctx.pathParam("wid");
		String uid = ctx.pathParam("uid");
		System.out.printf("Get WG %s user %s\n", wid, uid);
		
		// TODO: functionality
		RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
	}
	
	private static void registerGetUser(Javalin app) {
		app.get(basepath + "/{wid}/user/{uid}", ctx -> {
			epGetUser(ctx);
		});
	}
	
	public static void epDeleteUser(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		String wid = ctx.pathParam("wid");
		String uid = ctx.pathParam("uid");
		Logger logger = LoggerFactory.getLogger(WGEndpoints.class);
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		
		if(usr == null) {
			// noone's logged in
			logger.debug("no user logged in");
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		UUID wgid = UUID.fromString(wid);
		UUID userid = UUID.fromString(uid);
		try {
			if(!usr.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			WG wg = appCtx.wgManager.getWG(UUID.fromString(wid));
			if(wg == null) {
				// no such WG exists, respond with 401 to not leak information about which ones exist and which don't
				logger.debug("no such WG");
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			User targetusr = null;
			try{
				targetusr = new User(appCtx.conn, userid);
			} catch(SQLException e) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad user ID");
				return;
			}
			if(targetusr == null || !targetusr.isUserInWG(wgid)) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad user ID");
				return;
			}
			
			// point of (almost) no return
			// TODO: at some point, there should maybe be a permission system
			wg.removeUser(targetusr);
			ctx.status(HttpStatus.OK);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerDeleteUser(Javalin app) {
		app.delete(basepath + "/{wid}/user/{uid}", ctx -> {
			epDeleteUser(ctx);
		});
	}
	
	public static void epGetLists(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		String wid = ctx.pathParam("wid");
		
		
		Logger logger = LoggerFactory.getLogger(WGEndpoints.class);
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		
		if(usr == null) {
			// noone's logged in
			logger.debug("no user logged in");
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		UUID wgid = UUID.fromString(wid);
		
		try {
			if(!usr.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			WG wg = appCtx.wgManager.getWG(UUID.fromString(wid));
			if(wg == null) {
				// no such WG exists, respond with 401 to not leak information about which ones exist and which don't
				logger.debug("no such WG");
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
		
			ArrayList<ShoppingList> lists;
			lists = wg.lists(appCtx.conn);
			ArrayList<ListContentResponse> resp = new ArrayList<ListContentResponse>();
			for(var l : lists) {
				resp.add(new ListContentResponse(l));
			}
			
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerGetLists(Javalin app) {
		app.get(basepath + "/{wid}/list", ctx -> {
			epGetLists(ctx);
		});
	}
}
