package shareshop.rest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.notNull;
import static org.mockito.AdditionalMatchers.not;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.mockito.internal.matchers.Not;

import io.javalin.config.Key;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import jakarta.servlet.http.HttpServletRequest;
import shareshop.AppContext;
import shareshop.User;
import shareshop.Manager.UserManager;

class TCRestUser {
	
	private final Context ctx = mock(Context.class);
	private final AppContext appctx = mock(AppContext.class);
	private final User testusr = mock(User.class);
	private final UserManager usermgr = mock(UserManager.class);
	private final HttpServletRequest req = mock(HttpServletRequest.class);
	
	@BeforeEach
	void setup() {
		System.out.println("User Endpoints start");
		Key<AppContext> ctxKey = new Key<AppContext>("Context");
		when(ctx.appData(ctxKey)).thenReturn(appctx);
		when(ctx.req()).thenReturn(req);
		appctx.userManager = usermgr;
		when(testusr.getUserID()).thenReturn(UUID.randomUUID());
		when(usermgr.create(not(eq("existuser")), anyString())).thenReturn(testusr);
		when(usermgr.create(eq("existuser"), anyString())).thenReturn(null);
		
		when(usermgr.login("testuser", "pw")).thenReturn(testusr);
	}
	
	@BeforeAll
	static void setUpBeforeClass() throws Exception {
		
	}

	@AfterAll
	static void tearDownAfterClass() throws Exception {
	}

	@Test
	void testEpCreate() {
		when(ctx.body()).thenReturn("{\"email\":\"testuser\", \"password\":\"pw\"}");
		UsersEndpoints.epCreate(ctx);
		verify(ctx, atLeastOnce()).status(HttpStatus.OK);
	}
	
	@Test
	void testEpCreateExisting() {
		when(ctx.body()).thenReturn("{\"email\":\"existuser\", \"password\":\"anything\"}");
		UsersEndpoints.epCreate(ctx);
		verify(ctx, atLeastOnce()).status(HttpStatus.BAD_REQUEST);
	}

	@Test
	void testEpLogin() {
		when(ctx.body()).thenReturn("{\"email\":\"testuser\", \"password\":\"pw\"}");
		UsersEndpoints.epLogin(ctx);
		verify(ctx, atLeastOnce()).status(HttpStatus.OK);
		verify(ctx).sessionAttribute(eq("AuthorizedUID"), any());
		verify(req).changeSessionId();
	}
	
	@Test
	void testEpLoginFail() {
		when(ctx.body()).thenReturn("{\"email\":\"testuser\", \"password\":\"p\"}");
		UsersEndpoints.epLogin(ctx);
		verify(ctx, atLeastOnce()).status(HttpStatus.UNAUTHORIZED);
		verify(ctx, never()).sessionAttribute(eq("AuthorizedUID"), notNull());
	}

}
