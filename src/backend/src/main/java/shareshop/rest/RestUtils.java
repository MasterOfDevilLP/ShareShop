package shareshop.rest;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.javalin.config.Key;
import io.javalin.http.ContentType;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import jakarta.servlet.http.HttpSession;
import shareshop.AppContext;
import shareshop.User;
import shareshop.rest.requests.ErrorResponse;

public class RestUtils {
	public static User getAuthorizedUser(Context ctx) {
		
		Logger logger = LoggerFactory.getLogger(RestUtils.class);
		Key ctxKey = new Key<AppContext>("Context");
		AppContext appCtx = (AppContext) ctx.appData(ctxKey);
		
		HttpSession session = ctx.req().getSession(false);
		if(session == null) {
			// no session means there can't be a user
			logger.debug("No Session");
			return null;
		}
		
		UUID uid = (UUID)session.getAttribute("AuthorizedUID");
		if(uid == null) {
			logger.debug("No authorized UID");
			// no logged in user
			return null;
		}
		logger.debug("Retrieved UID {}", uid);
		return appCtx.userManager.getUser(uid);
	}
	
	public static void setResponseError(Context ctx, HttpStatus status, String message) {
		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		ctx.contentType(ContentType.JSON);
		ctx.result(gson.toJson(new ErrorResponse(message)));
		ctx.status(status);
	}
}
