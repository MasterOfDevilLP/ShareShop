package shareshop.rest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.notNull;
import static org.mockito.AdditionalMatchers.not;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Date;
import java.sql.SQLException;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.internal.matchers.Not;

import io.javalin.config.Key;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import shareshop.AppContext;
import shareshop.User;
import shareshop.WG;
import shareshop.Manager.UserManager;
import shareshop.Manager.WGManager;

class TCRestWG {
	
	private final Context ctx = mock(Context.class);
	private final AppContext appctx = mock(AppContext.class);
	private final User testusr = mock(User.class);
	private final UserManager usermgr = mock(UserManager.class);
	private final WGManager wgmgr = mock(WGManager.class);
	private final WG testwg = mock(WG.class);
	private final HttpServletRequest req = mock(HttpServletRequest.class);
	private final HttpSession session = mock(HttpSession.class);
	
	@BeforeEach
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
	
	void setUserLoggedIn(boolean loggedIn) {
		if(loggedIn) {
			UUID uid = testusr.getUserID();
			when(session.getAttribute("AuthorizedUID")).thenReturn(uid);
		} else {
			when(session.getAttribute("AuthorizedUID")).thenReturn(null);
		}
	}
	
	@BeforeAll
	static void setUpBeforeClass() throws Exception {
		
	}

	@AfterAll
	static void tearDownAfterClass() throws Exception {
	}

	@Test
	void testEpCreate() throws SQLException {
		when(ctx.body()).thenReturn("{\"name\":\"unit test wg\"}");
		setUserLoggedIn(true);
		WGEndpoints.epCreate(ctx);
		verify(ctx, atLeastOnce()).status(HttpStatus.OK);
		verify(wgmgr, atLeastOnce()).create(any(), eq("unit test wg"));
	}

	@Test
	void testEpCreateNoUser() throws SQLException {
		when(ctx.body()).thenReturn("{\"name\":\"unit test wg\"}");
		setUserLoggedIn(false);
		WGEndpoints.epCreate(ctx);
		verify(ctx, atLeastOnce()).status(HttpStatus.UNAUTHORIZED);
		verify(wgmgr, never()).create(any(), eq("unit test wg"));
	}
	
	@Test
	void testEpPatch() throws SQLException {
		when(ctx.body()).thenReturn("{\"name\":\"edit test wg\"}");
		UUID wid = testwg.getWgID();
		when(ctx.pathParam("wid")).thenReturn(wid.toString());
		setUserLoggedIn(true);
		WGEndpoints.epPatch(ctx);
		verify(ctx, atLeastOnce()).status(HttpStatus.OK);
		verify(testwg, atLeastOnce()).setWgName(eq("edit test wg"));
	}
	
	@Test
	void testEpPatchWrongWID() throws SQLException {
		when(ctx.body()).thenReturn("{\"name\":\"edit test wg\"}");
		UUID wid = UUID.randomUUID();
		while(wid.equals(testwg.getWgID())) {
			wid = UUID.randomUUID();
		}
		when(ctx.pathParam("wid")).thenReturn(wid.toString());
		setUserLoggedIn(true);
		WGEndpoints.epPatch(ctx);
		verify(ctx, atLeastOnce()).status(HttpStatus.UNAUTHORIZED);
		verify(testwg, never()).setWgName(any());
	}
}
