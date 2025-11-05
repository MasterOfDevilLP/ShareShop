package shareshop.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.config.Key;
import io.javalin.http.ContentType;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import jakarta.servlet.http.HttpSession;
import shareshop.AppContext;
import shareshop.User;
import shareshop.rest.requests.CreateUserRequest;
import shareshop.rest.requests.CreateUserResponse;
import shareshop.rest.requests.LoginRequest;
import shareshop.rest.requests.UserInformationResponse;

public class UsersEndpoints {
	
	private final static String basepath = "/user";
	
	public static void register(Javalin app) {
		// TODO Auto-generated method stub
		registerCreate(app);
		registerLogout(app);
		registerLogin(app);
		registerGet(app);
		registerModify(app);
	}
	
	public static void epCreate(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		try {
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			CreateUserRequest req = gson.fromJson(ctx.body(), CreateUserRequest.class);
			if(!req.validate()) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
				ctx.status(HttpStatus.BAD_REQUEST);
				return;
			}
			
			AppContext appCtx = (AppContext) ctx.appData(ctxKey);
			User usr = appCtx.userManager.create(req.email, req.password);
			if(usr == null) {
				// this could either be some internal error, or an account with the same email already existing
				// this way, no information about existing accounts should be leaked (maybe a timing side-channel)
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "Failed to create user");
			} else {
				CreateUserResponse resp = new CreateUserResponse(usr);
				
				ctx.contentType(ContentType.JSON);
				ctx.result(gson.toJson(resp));
				ctx.status(HttpStatus.OK);
			}
			
			/*ctx.contentType(ContentType.JSON);
			ctx.result(String.format("{\"id\":\"%s\"}", "59813uuid"));
			ctx.status(HttpStatus.OK);*/
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
	
	public static void epLogin(Context ctx) {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		Logger logger = LoggerFactory.getLogger(UsersEndpoints.class);
		try {
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			LoginRequest req = gson.fromJson(ctx.body(), LoginRequest.class);
			if(!req.validate()) {
				RestUtils.setResponseError(ctx, HttpStatus.BAD_REQUEST, "bad or missing parameters");
				return;
			}
			
			User oldusr = RestUtils.getAuthorizedUser(ctx);
			if(oldusr != null) {
				// some user is logged in, invalidate that session
				ctx.req().getSession().invalidate();	// somehow this fails
				logger.info("User still logged in on login request, loggin out");
			}
			
			AppContext appCtx = (AppContext) ctx.appData(ctxKey);
			User usr = appCtx.userManager.login(req.email, req.password);
			if(usr == null) {
				// login failed for some reason
				// TODO: maybe respond with a 500 error code for server issues 
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "Failed to log in");
			} else {
				ctx.req().getSession();	// create the session
				ctx.req().changeSessionId();
				ctx.sessionAttribute("AuthorizedUID", usr.getUserID());
				ctx.status(HttpStatus.OK);
			}
			
			/*ctx.contentType(ContentType.JSON);
			ctx.result(String.format("{\"id\":\"%s\"}", "59813uuid"));
			ctx.status(HttpStatus.OK);*/
		} catch(Exception e) {
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerLogin(Javalin app) {
		app.post(basepath + "/login", ctx -> {
			epLogin(ctx);
		});
	}
	
	public static void epLogout(Context ctx) {
		try {
			HttpSession session = ctx.req().getSession(false); 
			if(session != null) {
				// this does not delete the session cookie, but since the session is invalidated anyways, that doesn't matter
				session.invalidate();
			}
			ctx.status(HttpStatus.OK);			
		} catch(Exception e) {
			e.printStackTrace();
			RestUtils.setResponseError(ctx, HttpStatus.INTERNAL_SERVER_ERROR, "internal error");
		}
	}
	
	private static void registerLogout(Javalin app) {
		app.post(basepath + "/logout", ctx -> {
			epLogout(ctx);
		});
	}
			
	public static void epGet(Context ctx) {
		User usr = RestUtils.getAuthorizedUser(ctx);
		if(usr != null) {
			Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
			UserInformationResponse resp = new UserInformationResponse(usr);
			ctx.contentType(ContentType.JSON);
			ctx.result(gson.toJson(resp));
			ctx.status(HttpStatus.OK);
		} else {				
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
		}
	}
	
	private static void registerGet(Javalin app) {
		app.get(basepath, ctx -> {
			epGet(ctx);
		});
	}
	
	public static void epModify(Context ctx) {
		User usr = RestUtils.getAuthorizedUser(ctx);
		if(usr != null) {
			// TODO: process the actual request
			RestUtils.setResponseError(ctx, HttpStatus.NOT_IMPLEMENTED, "Not yet implemented");
		} else {				
			RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "not logged in");
		}
	}
	
	private static void registerModify(Javalin app) {
		app.post(basepath, ctx -> {
			epModify(ctx);
		});
	}
	
}
