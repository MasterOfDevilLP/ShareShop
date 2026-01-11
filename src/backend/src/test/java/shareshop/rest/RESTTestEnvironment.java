package shareshop.rest;

import static org.mockito.AdditionalMatchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.sql.Date;
import java.sql.SQLException;
import java.util.UUID;

import io.javalin.config.Key;
import io.javalin.http.Context;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import shareshop.AppContext;
import shareshop.User;
import shareshop.WG;
import shareshop.Manager.UserManager;
import shareshop.Manager.WGManager;

/**
 * Helper class to provide an environment for unit tests for the REST API.
 */
public class RESTTestEnvironment {

	/**
	 * mocked Javalin request context, only returns AppContext
	 */
	public final Context ctx = mock(Context.class);
	/**
	 * mocked AppContext
	 */
	public final AppContext appctx = mock(AppContext.class);
	/**
	 * mocked test user
	 */
	public final User testusr = mock(User.class);
	/**
	 * mocked UserManager, only accepts testuser:pw
	 */
	public final UserManager usermgr = mock(UserManager.class);
	/**
	 * mocked WGManager
	 */
	public final WGManager wgmgr = mock(WGManager.class);
	/**
	 * mocked test WG, random wid
	 */
	public final WG testwg = mock(WG.class);
	/**
	 * mocked HTTPServletRequest, used for all requests, has a session attached
	 */
	public final HttpServletRequest req = mock(HttpServletRequest.class);
	/**
	 * mocked HttpSession, attached to mocked request
	 */
	public final HttpSession session = mock(HttpSession.class);
	
	/**
	 * setup mocked test environment
	 * @throws SQLException
	 */
	void setup() throws SQLException {
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		when(ctx.appData(ctxKey)).thenReturn(appctx);
		when(ctx.req()).thenReturn(req);
		when(req.getSession()).thenReturn(session);
		when(req.getSession(anyBoolean())).thenReturn(session);
		appctx.userManager = usermgr;
		appctx.wgManager = wgmgr;
		UUID uid = UUID.randomUUID();
		when(testusr.getUserID()).thenReturn(uid);
		when(usermgr.create(not(eq("existuser")), anyString())).thenReturn(testusr);
		when(usermgr.create(eq("existuser"), anyString())).thenReturn(null);
		
		when(usermgr.login("testuser", "pw")).thenReturn(testusr);
		when(usermgr.getUser(eq(testusr.getUserID()))).thenReturn(testusr);
		when(usermgr.getUser(not(eq(testusr.getUserID())))).thenReturn(null);
		
		// WG stuff
		UUID wid = UUID.randomUUID();
		when(testwg.getWgID()).thenReturn(wid);
		when(testwg.getWgName()).thenReturn("unit test wg");
		when(testwg.getCreationDate()).thenReturn(new Date(58913));	// just a random number
		when(wgmgr.create(any(), any())).thenReturn(testwg);
		when(wgmgr.getWG(eq(wid))).thenReturn(testwg);
		when(wgmgr.getWG(not(eq(wid)))).thenReturn(null);
		
		when(testusr.isUserInWG(eq(wid))).thenReturn(true);
		when(testusr.isUserInWG(not(eq(wid)))).thenReturn(false);
		
	}
	
	/**
	 * sets the AuthorizedUID of the mocked session
	 * @param loggedIn whether the user is logged in or not
	 */
	void setUserLoggedIn(boolean loggedIn) {
		if(loggedIn) {
			UUID uid = testusr.getUserID();
			when(session.getAttribute("AuthorizedUID")).thenReturn(uid);
		} else {
			when(session.getAttribute("AuthorizedUID")).thenReturn(null);
		}
	}
	
}
