package shareshop.rest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.notNull;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.SQLException;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import io.javalin.http.HttpStatus;

class TCRestUser {
	
	private RESTTestEnvironment env;
	
	@BeforeEach
	void setup() throws SQLException {
		env = new RESTTestEnvironment();
		env.setup();
	}
	
	@BeforeAll
	static void setUpBeforeClass() throws Exception {
		
	}

	@AfterAll
	static void tearDownAfterClass() throws Exception {
	}

	@Test
	void testEpCreate() {
		when(env.ctx.body()).thenReturn("{\"email\":\"testuser\", \"password\":\"pw\"}");
		UsersEndpoints.epCreate(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.OK);
	}
	
	@Test
	void testEpCreateExisting() {
		when(env.ctx.body()).thenReturn("{\"email\":\"existuser\", \"password\":\"anything\"}");
		UsersEndpoints.epCreate(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.BAD_REQUEST);
	}

	@Test
	void testEpLogin() {
		when(env.ctx.body()).thenReturn("{\"email\":\"testuser\", \"password\":\"pw\"}");
		UsersEndpoints.epLogin(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.OK);
		verify(env.ctx).sessionAttribute(eq("AuthorizedUID"), any());
		verify(env.req).changeSessionId();
	}
	
	@Test
	void testEpLoginFail() {
		when(env.ctx.body()).thenReturn("{\"email\":\"testuser\", \"password\":\"p\"}");
		UsersEndpoints.epLogin(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.UNAUTHORIZED);
		verify(env.ctx, never()).sessionAttribute(eq("AuthorizedUID"), notNull());
	}
	
	// there isn't really a case where a logout should fail
	@Test
	void testLogout() {
		UsersEndpoints.epLogout(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.OK);
		verify(env.session).invalidate();
		verify(env.ctx, never()).sessionAttribute(eq("AuthorizedUID"), notNull());
	}

}
