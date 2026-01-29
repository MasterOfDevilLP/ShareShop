package shareshop.rest;

import java.sql.SQLException;
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
import shareshop.WG;
import shareshop.rest.requests.ErrorResponse;

/**
 * A collection of static methods implementing functionality commonly needed within the implementation of the REST API
 */
public class RestUtils {
	/**
	 * Get the user associated with the current session
	 * @param ctx Javalin request context
	 * @return Currently logged in user,  or null if no user is logged in
	 */
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
	
	/**
	 * Sets up the request context to return an error message in a common format 
	 * @param ctx Javalin request context
	 * @param status The HTTP status code to return
	 * @param message A message to return to the client, may describe the error further
	 */
	public static void setResponseError(Context ctx, HttpStatus status, String message) {
		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		ctx.contentType(ContentType.JSON);
		ctx.result(gson.toJson(new ErrorResponse(message)));
		ctx.status(status);
	}
	
	// retrieves a UUID from a path parameter
	// returns null and sets a response error if this fails
	public static UUID getPathParamUUIDSafe(Context ctx, String key) {
		String id = ctx.pathParam(key);
		try {
			UUID uuid = UUID.fromString(id);
			return uuid;
		} catch(IllegalArgumentException e) {
			setResponseError(ctx, HttpStatus.BAD_REQUEST, "malformed UUID");
			return null;
		}
	}
	
	public static WG getWGAsMember(Context ctx, UUID wgid, User user, AppContext appCtx) {
		Logger logger = LoggerFactory.getLogger(RestUtils.class);
		try {
			if(!user.isUserInWG(wgid)) {
				// wrong WG
				logger.debug("wrong WG. Expected {}, got {}", user.getWgIDList().toString(), wgid);
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return null;
			}
			
			WG wg = appCtx.wgManager.getWG(wgid);
			if(wg == null) {
				// no such WG exists, respond with 401 to not leak information about which ones exist and which don't
				logger.debug("no such WG");
				RestUtils.setResponseError(ctx, HttpStatus.UNAUTHORIZED, "incorrect WG");
				return null;
			}
			return wg;
		} catch(SQLException e) {
			// no idea why
			e.printStackTrace();
			return null;
		}
	}
}
