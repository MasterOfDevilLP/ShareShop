package shareshop.rest;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.javalin.config.Key;
import io.javalin.http.Context;
import jakarta.servlet.http.HttpSession;
import shareshop.AppContext;
import shareshop.User;

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
}
