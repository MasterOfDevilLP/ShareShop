package shareshop.rest;

import java.math.BigDecimal;
import java.sql.SQLException;
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
import shareshop.Item;
import shareshop.ShoppingList;
import shareshop.ShoppingList.Change;
import shareshop.User;
import shareshop.WG;
import shareshop.rest.requests.AddChangeRequest;
import shareshop.rest.requests.CreateListRequest;
import shareshop.rest.requests.CreateListResponse;
import shareshop.rest.requests.ListContentResponse;

public class ListEndpoints {
	
	private final static String basepath = "/wg/{wid}/list";
	
	public static void register(Javalin app) {
		registerCreate(app);
		registerGet(app);
		registerPost(app);
		registerDelete(app);
		registerGetAudit(app);
	}
	
	public static void epCreate(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		String wid = ctx.pathParam("wid");
		try {
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			CreateListRequest req = gson.fromJson(ctx.body(), CreateListRequest.class);
			if(!req.validate()) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
				return;
			}
			
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
			
			if(!wgid.equals(usr.getWgID())) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgID(), wgid);
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
			
			ShoppingList slist = wg.createList(appCtx.conn, usr, req.name);
			if(slist == null) {
				logger.error("Failed to create shopping list");
				RestUtils.setResponseError(ctx, HttpStatus.FORBIDDEN, "failed to create list");
				return;
			}
			
			CreateListResponse resp = new CreateListResponse(slist);
			
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch(Exception e) {
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerCreate(Javalin app) {
		app.post(basepath, ctx -> {
			epCreate(ctx);
		});
	}
	
	public static void epGet(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		String wid = ctx.pathParam("wid");
		String lid = ctx.pathParam("lid");
		
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
		
		if(!wgid.equals(usr.getWgID())) {
			// wrong WG
			logger.debug("wrong WG. Expected {}, got {}", usr.getWgID(), wgid);
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
		
		try {
			ShoppingList slist = wg.getList(appCtx.conn, UUID.fromString(lid));
			if(slist == null) {
				logger.debug("no such list");
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect list");
				return;
			}
			
			ListContentResponse resp = new ListContentResponse(slist);
			
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch(SQLException e) {
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerGet(Javalin app) {
		app.get(basepath + "/{lid}", ctx -> {
			epGet(ctx);
		});
	}
	
	public static void epPost(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		String wid = ctx.pathParam("wid");
		String lid = ctx.pathParam("lid");
		
		Logger logger = LoggerFactory.getLogger(WGEndpoints.class);
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		
		if(usr == null) {
			// noone's logged in
			logger.debug("no user logged in");
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		AddChangeRequest req = gson.fromJson(ctx.body(), AddChangeRequest.class);
		if(!req.validate()) {
			RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
			return;
		}
		
		UUID wgid = UUID.fromString(wid);
		
		if(!wgid.equals(usr.getWgID())) {
			// wrong WG
			logger.debug("wrong WG. Expected {}, got {}", usr.getWgID(), wgid);
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
		
		try {
			ShoppingList slist = wg.getList(appCtx.conn, UUID.fromString(lid));
			if(slist == null) {
				logger.debug("no such list");
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect list");
				return;
			}
			
			Item item = appCtx.itemManager.getItem(req.iid);
			if(item == null || !item.getWgID().equals(wgid)) {
				logger.debug("no such item or wrong wg");
				RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "unknown item");
				return;
			}
			
			// TODO: validate amounts
			switch(req.type) {
			case "add":
				slist.addChange(appCtx.conn, usr, item, Change.ADD, req.amount);
				break;
			case "remove":
				slist.addChange(appCtx.conn, usr, item, Change.REMOVE, req.amount);
				break;
			case "tick":
				slist.addChange(appCtx.conn, usr, item, Change.TICK, req.amount, req.price == null ? new BigDecimal(0) : req.price);
				break;
			default:
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "unknown change type");
				return;
			}
			
			// respond with the list content to avoid requiring another request to get the updated status (or relying on calculating that client-side)
			ListContentResponse resp = new ListContentResponse(slist);
			
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch(SQLException e) {
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerPost(Javalin app) {
		app.post(basepath + "/{lid}", ctx -> {
			epPost(ctx);
		});
	}
	
	public static void epDelete(Context ctx) {
		String wid = ctx.pathParam("wid");
		String lid = ctx.pathParam("lid");
		System.out.printf("Delete WG %s list %s\n", wid, lid);
		
		// TODO: functionality
		RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
	}
	
	private static void registerDelete(Javalin app) {
		app.delete(basepath + "/{lid}", ctx -> {
			epDelete(ctx);
		});
	}
	
	public static void epGetAudit(Context ctx) {
		String wid = ctx.pathParam("wid");
		String lid = ctx.pathParam("lid");
		System.out.printf("Get WG %s list %s Audit log\n", wid, lid);
		
		// TODO: functionality
		RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
	}
	
	private static void registerGetAudit(Javalin app) {
		app.get(basepath + "/{lid}/audit", ctx -> {
			epGetAudit(ctx);
		});
	}

}
