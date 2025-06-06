package shareshop.rest;

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

public class UsersEndpoints {
	
	private final static String basepath = "/user";
	
	public static void register(Javalin app) {
		// TODO Auto-generated method stub
		registerCreate(app);
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
	
	private static void registerGet(Javalin app) {
		app.get(basepath, ctx -> {
			// TODO: requires SessionManager to make sense
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerModify(Javalin app) {
		app.post(basepath, ctx -> {
			// TODO: requires SessionManager to make sense
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
}
