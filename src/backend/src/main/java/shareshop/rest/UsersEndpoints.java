package shareshop.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.config.Key;
import io.javalin.http.ContentType;
import io.javalin.http.HttpStatus;
import shareshop.AppContext;
import shareshop.User;
import shareshop.rest.requests.CreateUserRequest;
import shareshop.rest.requests.CreateUserResponse;
import shareshop.rest.requests.LoginRequest;

public class UsersEndpoints {
	
	private final static String basepath = "/user";
	
	public static void register(Javalin app) {
		// TODO Auto-generated method stub
		registerCreate(app);
		registerLogin(app);
		registerGet(app);
		registerModify(app);
	}
	
	private static void registerCreate(Javalin app) {
		Key ctxKey = new Key<AppContext>("Context");
		app.post(basepath + "/create", ctx -> {
			
			try {
				Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
				CreateUserRequest req = gson.fromJson(ctx.body(), CreateUserRequest.class);
				if(!req.validate()) {
					ctx.status(HttpStatus.BAD_REQUEST);
					return;
				}
				
				AppContext appCtx = (AppContext) ctx.appData(ctxKey);
				User usr = appCtx.userManager.create(req.username, req.password);
				if(usr == null) {
					// this could either be some internal error, or an account with the same email already existing
					// this way, no information about existing accounts should be leaked (maybe a timing side-channel)
					ctx.status(400);
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
				ctx.status(400);
			}
			
		});
	}
	
	private static void registerLogin(Javalin app) {
		Key ctxKey = new Key<AppContext>("Context");
		app.post(basepath + "/login", ctx -> {
			Logger logger = LoggerFactory.getLogger(UsersEndpoints.class);
			try {
				Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
				LoginRequest req = gson.fromJson(ctx.body(), LoginRequest.class);
				if(!req.validate()) {
					ctx.status(HttpStatus.BAD_REQUEST);
					return;
				}
				
				User oldusr = RestUtils.getAuthorizedUser(ctx);
				if(oldusr != null) {
					// some user is logged in, invalidate that session
					ctx.req().getSession().invalidate();	// somehow this fails
					logger.info("User still logged in on login request, loggin out");
				}
				
				AppContext appCtx = (AppContext) ctx.appData(ctxKey);
				User usr = appCtx.userManager.login(req.username, req.password);
				if(usr == null) {
					// login failed for some reason
					// TODO: maybe respond with a 500 error code for server issues 
					ctx.status(HttpStatus.UNAUTHORIZED);
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
				ctx.status(400);
			}
			
		});
	}
	
	private static void registerGet(Javalin app) {
		app.get(basepath, ctx -> {
			User usr = RestUtils.getAuthorizedUser(ctx);
			if(usr != null) {
				// TODO: return actual information
				ctx.status(HttpStatus.OK);
			} else {				
				ctx.status(HttpStatus.UNAUTHORIZED);
			}
		});
	}
	
	private static void registerModify(Javalin app) {
		app.post(basepath, ctx -> {
			User usr = RestUtils.getAuthorizedUser(ctx);
			if(usr != null) {
				// TODO: process the actual request
				ctx.status(HttpStatus.OK);
			} else {				
				ctx.status(HttpStatus.UNAUTHORIZED);
			}
		});
	}
	
}
