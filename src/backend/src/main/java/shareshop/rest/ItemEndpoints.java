package shareshop.rest;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.config.Key;
import io.javalin.http.ContentType;
import io.javalin.http.HttpStatus;
import shareshop.AppContext;
import shareshop.Item;
import shareshop.User;
import shareshop.WG;
import shareshop.rest.requests.CreateItemRequest;
import shareshop.rest.requests.CreateItemResponse;
import shareshop.rest.requests.CreateWGRequest;
import shareshop.rest.requests.CreateWGResponse;
import shareshop.rest.requests.ItemInformationResponse;

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
		Key ctxKey = new Key<AppContext>("Context");
		app.get(basepath, ctx -> {
			String wid = ctx.pathParam("wid");
			
			// search parameters
			String category = ctx.queryParam("category");
			String iid = ctx.queryParam("iid");
			String query = ctx.queryParam("q");
			
			
			Logger logger = LoggerFactory.getLogger(ItemEndpoints.class);
			AppContext appCtx = (AppContext) ctx.appData(ctxKey);
			User usr = RestUtils.getAuthorizedUser(ctx);
			
			if(usr == null) {
				// noone's logged in
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
				return;
			}
			
			UUID wgid = UUID.fromString(wid);
			
			if(!usr.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			// TODO: search is effectively stubbed currently
			Item[] items = appCtx.itemManager.search(appCtx.wgManager.getWG(wgid), "");
			
			ItemInformationResponse[] resp = new ItemInformationResponse[items.length];
			int idx = 0;
			for(Item i : items) {
				resp[idx] = new ItemInformationResponse(i);
				idx++;
			}
			
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		});
	}
	
	private static void registerGetItem(Javalin app) {
		Key ctxKey = new Key<AppContext>("Context");
		app.get(basepath + "/{iid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String iid = ctx.pathParam("iid");
			
			Logger logger = LoggerFactory.getLogger(ItemEndpoints.class);
			AppContext appCtx = (AppContext) ctx.appData(ctxKey);
			User usr = RestUtils.getAuthorizedUser(ctx);
			
			if(usr == null) {
				// noone's logged in
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
				return;
			}
			
			UUID wgid = UUID.fromString(wid);
			
			if(!usr.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			Item item = appCtx.itemManager.getItem(UUID.fromString(iid));
			if(item == null || !item.getWgID().equals(wgid)) {
				// no such item
				logger.debug("No such item");
				RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "unknown item");
				return;
			}
			
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			ItemInformationResponse resp = new ItemInformationResponse(item);
			
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		});
	}
	
	private static void registerDelete(Javalin app) {
		app.delete(basepath + "/{iid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String iid = ctx.pathParam("iid");
			
			System.out.printf("WG %s delete item %s\n", wid, iid);
			
			// TODO: functionality
			RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
		});
	}
	
	private static void registerPatch(Javalin app) {
		app.patch(basepath + "/{iid}", ctx -> {
			String wid = ctx.pathParam("wid");
			String iid = ctx.pathParam("iid");
			
			System.out.printf("WG %s patch item %s\n", wid, iid);
			
			// TODO: Request object (will likely just be the item class)
			// TODO: functionality
			RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
		});
	}
	
	private static void registerPost(Javalin app) {
		Key ctxKey = new Key<AppContext>("Context");
		app.post(basepath, ctx -> {
			String wid = ctx.pathParam("wid");
			Logger logger = LoggerFactory.getLogger(ItemEndpoints.class);
			AppContext appCtx = (AppContext) ctx.appData(ctxKey);
			User usr = RestUtils.getAuthorizedUser(ctx);
			
			if(usr == null) {
				// noone's logged in
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
				return;
			}
			
			UUID wgid = UUID.fromString(wid);
			
			if(!usr.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", usr.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return;
			}
			
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			CreateItemRequest req = gson.fromJson(ctx.body(), CreateItemRequest.class);
			
			if(!req.validate()) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
				return;
			}
			
			WG wg = appCtx.wgManager.getWG(wgid);
			Item item = appCtx.itemManager.createItem(wg, usr, req.name, req.description, req.price);
			
			CreateItemResponse resp = new CreateItemResponse(item);
			
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		});
	}
}
