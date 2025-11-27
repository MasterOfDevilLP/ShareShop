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
	void testEpCreate() throws SQLException {
		when(env.ctx.body()).thenReturn("{\"name\":\"unit test wg\"}");
		env.setUserLoggedIn(true);
		WGEndpoints.epCreate(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.OK);
		verify(env.wgmgr, atLeastOnce()).create(any(), eq("unit test wg"));
	}

	@Test
	void testEpCreateNoUser() throws SQLException {
		when(env.ctx.body()).thenReturn("{\"name\":\"unit test wg\"}");
		env.setUserLoggedIn(false);
		WGEndpoints.epCreate(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.UNAUTHORIZED);
		verify(env.wgmgr, never()).create(any(), eq("unit test wg"));
	}
	
	@Test
	void testEpPatch() throws SQLException {
		when(env.ctx.body()).thenReturn("{\"name\":\"edit test wg\"}");
		UUID wid = env.testwg.getWgID();
		when(env.ctx.pathParam("wid")).thenReturn(wid.toString());
		env.setUserLoggedIn(true);
		WGEndpoints.epPatch(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.OK);
		verify(env.testwg, atLeastOnce()).setWgName(eq("edit test wg"));
	}
	
	@Test
	void testEpPatchWrongWID() throws SQLException {
		when(env.ctx.body()).thenReturn("{\"name\":\"edit test wg\"}");
		UUID wid = UUID.randomUUID();
		while(wid.equals(env.testwg.getWgID())) {
			wid = UUID.randomUUID();
		}
		when(env.ctx.pathParam("wid")).thenReturn(wid.toString());
		env.setUserLoggedIn(true);
		WGEndpoints.epPatch(env.ctx);
		verify(env.ctx, atLeastOnce()).status(HttpStatus.UNAUTHORIZED);
		verify(env.testwg, never()).setWgName(any());
	}
}
