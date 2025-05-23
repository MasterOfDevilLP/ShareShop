package shareshop.rest;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.Javalin;
import io.javalin.http.ContentType;
import io.javalin.http.HttpStatus;
import shareshop.rest.requests.CreateUserRequest;

public class UsersEndpoints{
	
	public static void register(Javalin app) {
		// TODO Auto-generated method stub
		registerCreate(app);
		registerGet(app);
		registerModify(app);
	}
	
	private static void registerCreate(Javalin app) {
		app.post("/user/create", ctx -> {
			
			try {
				Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
				CreateUserRequest req = gson.fromJson(ctx.body(), CreateUserRequest.class);
				if(!req.validate()) {
					ctx.status(HttpStatus.BAD_REQUEST);
					return;
				}
				
				
				System.out.println(String.format("Created user %s", req.username));
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
		app.get("/user", ctx -> {
			// TODO: requires SessionManager to make sense
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
	private static void registerModify(Javalin app) {
		app.post("/user", ctx -> {
			// TODO: requires SessionManager to make sense
			ctx.status(HttpStatus.UNAUTHORIZED);
		});
	}
	
}
