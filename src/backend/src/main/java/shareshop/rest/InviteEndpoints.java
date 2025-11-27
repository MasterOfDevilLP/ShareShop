package shareshop.rest;

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
import shareshop.Invite;
import shareshop.User;
import shareshop.WG;
import shareshop.rest.requests.AcceptInviteRequest;
import shareshop.rest.requests.CreateInviteRequest;
import shareshop.rest.requests.CreateInviteResponse;
import shareshop.rest.requests.GetInviteAsMemberResponse;
import shareshop.rest.requests.GetInviteResponse;

public class InviteEndpoints {
	
	private final static String basepath = "/invite";
	private final static String wg_basepath = "/wg/{wid}/invite";
	
	public static void register(Javalin app) {
		registerCreate(app);
		registerDelete(app);
		registerGet(app);
		registerGetWG(app);
		registerPost(app);
	}
	
	public static void epCreate(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		Logger logger = LoggerFactory.getLogger(InviteEndpoints.class);
		try {
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			CreateInviteRequest req = gson.fromJson(ctx.body(), CreateInviteRequest.class);
			AppContext appCtx = (AppContext) ctx.appData(ctxKey);
			User usr = RestUtils.getAuthorizedUser(ctx);
			
			User targetUser = null;
			
			if(usr == null) {
				// noone's logged in
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
				return;
			}
			
			if(!req.validate()) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
				return;
			}
			if(req.forUser != null) {
				targetUser = appCtx.userManager.getUser(req.forUser); 
				if(targetUser == null) {
					RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "invalid target user");
					return;
				}
			}
			
			UUID wgid = RestUtils.getPathParamUUIDSafe(ctx, "wid");
			if(wgid == null) return;
			WG wg = RestUtils.getWGAsMember(ctx, wgid, usr, appCtx);
			if(wg == null) {
				// errors are already set
				return;
			}
			
			// TODO: check permissions
			Invite inv = wg.createInvite(targetUser, req.expires);
			// assume it worked, as I don't know why it should fail
			CreateInviteResponse resp = new CreateInviteResponse(inv);
			
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch(Exception e) {
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerCreate(Javalin app) {
		app.post(wg_basepath, ctx -> {
			epCreate(ctx);
		});
	}
	
	public static void epDelete(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		if(usr == null) {
			// noone's logged in
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		UUID wgid = RestUtils.getPathParamUUIDSafe(ctx, "wid");
		UUID ivid = RestUtils.getPathParamUUIDSafe(ctx, "ivid");
		if(wgid == null || ivid == null) {
			return;
		}
		WG wg = RestUtils.getWGAsMember(ctx, wgid, usr, appCtx);
		if(wg == null) {
			// errors are already set
			return;
		}
		
		try {
			Invite inv = new Invite(appCtx.conn, ivid);
			if(!inv.getWgID().equals(wgid)) {
				// choosing 404 here, because while the invite exists, it's not associated with the correct wg, making it irrelevant
				RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "invite not found");
				return;
			}
			// TODO; check permissions
			inv.remove();
			ctx.status(HttpStatus.OK);
		} catch(SQLException e) {
			RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "invite not found");
			return;
		}
	}
	
	private static void registerDelete(Javalin app) {
		app.delete(wg_basepath + "/{ivid}", ctx -> {
			epDelete(ctx);
		});
	}
	
	public static void epGetWG(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		if(usr == null) {
			// noone's logged in
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		UUID wgid = RestUtils.getPathParamUUIDSafe(ctx, "wid");
		UUID ivid = RestUtils.getPathParamUUIDSafe(ctx, "ivid");
		if(wgid == null || ivid == null) {
			return;
		}
		WG wg = RestUtils.getWGAsMember(ctx, wgid, usr, appCtx);
		if(wg == null) {
			// errors are already set
			return;
		}
		
		try {
			Invite inv = new Invite(appCtx.conn, ivid);
			if(!inv.getWgID().equals(wgid)) {
				// choosing 404 here, because while the invite exists, it's not associated with the correct wg, making it irrelevant
				RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "invite not found");
				return;
			}
			
			GetInviteAsMemberResponse resp = new GetInviteAsMemberResponse(inv);
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch(SQLException e) {
			RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "invite not found");
			return;
		}
	}
	
	private static void registerGetWG(Javalin app) {
		app.get(wg_basepath + "/{ivid}", ctx -> {
			epGetWG(ctx);
		});
	}

	public static void epGet(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		User usr = RestUtils.getAuthorizedUser(ctx);
		if(usr == null) {
			// noone's logged in
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
			return;
		}
		
		UUID ivid = RestUtils.getPathParamUUIDSafe(ctx, "ivid");
		if(ivid == null) {
			return;
		}
		
		try {
			Invite inv = new Invite(appCtx.conn, ivid);
			UUID wgid = inv.getWgID();
			UUID inviteUID = inv.getUserID();
			if(inviteUID != null && !inviteUID.equals(usr.getUserID())) {
				// wrong user!
				RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "bad invite");
				return;
			}
			
			// at this point, the user is allowed to handle this invite
			WG wg = appCtx.wgManager.getWG(inv.getWgID());
			// if this returned null, either an error occurred, or there was a dangling invite, which should not happen
			
			GetInviteResponse resp = new GetInviteResponse(inv, wg);
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} catch(SQLException e) {
			RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "invite not found");
			return;
		}
	}
	
	private static void registerGet(Javalin app) {
		app.get(basepath + "/{ivid}", ctx -> {
			epGet(ctx);
		});
	}
	
	public static void epPost(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		AcceptInviteRequest req = gson.fromJson(ctx.body(), AcceptInviteRequest.class);
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
		
		try {
			Invite inv = new Invite(appCtx.conn, req.id);
			UUID wgid = inv.getWgID();
			UUID inviteUID = inv.getUserID();
			if(inviteUID != null && !inviteUID.equals(usr.getUserID())) {
				// wrong user!
				RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "bad invite");
				return;
			}
			
			// at this point, the user is allowed to handle this invite
			WG wg = appCtx.wgManager.getWG(inv.getWgID());
			// if this returned null, either an error occurred, or there was a dangling invite, which should not happen
			
			if(usr.isUserInWG(wgid)) {
				// already a member, can't join again
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "Already a member");
				return;
			}
			
			// attempt to join now
			boolean succ = wg.joinViaInvite(inv, usr);
			if(!succ) {
				// the reason isn't communicated back, but the only reason left should be an expired invite, which is equal to a non-existant one
				RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "invite not found");
				return;
			}
			
			ctx.status(HttpStatus.OK);
		} catch(SQLException e) {
			RestUtils.setResponseError(ctx, HttpStatus.NOT_FOUND, "invite not found");
			return;
		}
	}
	
	private static void registerPost(Javalin app) {
		app.post(basepath, ctx -> {
			epPost(ctx);
		});
	}
}
