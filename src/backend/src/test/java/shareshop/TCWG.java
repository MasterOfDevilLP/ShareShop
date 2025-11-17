package shareshop;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.security.DrbgParameters.Reseed;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * Test Case Item
 * functions with Tag "DB" need DB connection
 */
public class TCWG {
    private static final UUID testWgUUID = UUID.randomUUID();
    private static final String testWgName = "TCWGName";
    private static final Date testWgDate = Date.valueOf(LocalDate.now());
    private static final UUID testWgSetterUUID = UUID.randomUUID();
    private static final String testWgSetterName = "TCWGSetterName";
    private static final Date testWgSetterDate = Date.valueOf(LocalDate.now());
    private static final UUID testWgUserUUID = UUID.randomUUID();
    private static final String testWgUserEmail = "TCWG@test.test";
    private static final String testWgUserPw = "TCWGTestPW";
    private static final UUID testWgUser2UUID = UUID.randomUUID();
    private static final String testWgUser2Email = "TCWG2@test.test";
    private static final String testWgUser2Pw = "TCWG2TestPW";
    private static final UUID testWgUser3UUID = UUID.randomUUID();
    private static final String testWgUser3Email = "TCWG3@test.test";
    private static final String testWgUser3Pw = "TCWG3TestPW";
    private static final String testWgShoppingListName = "TCWGShoppingListName";
    private UUID testWgCleanupUUID = null;
    private UUID testWgShoppingListCleanupUUID = null;

    /**
     * creates a connection to the DB and opens it
     * @return DBConnectionHandler
     * @throws SQLException
     */
    static DBConnectionHandler getDBconnection() throws SQLException {
        // opening connection to Database (compiling now needs running Database)
        String[] args = {};
        Config config = null;
        try {
            config = new ConfigLoader().loadConfig(args);
        } catch (RuntimeException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }

        DBConnectionHandler connectionHandler = new DBConnectionHandler(config.getDBConfig());
        connectionHandler.open();
        return connectionHandler;
    }

    @BeforeAll
    @Tag("DB")
    static void setUpBeforeClass() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testWgString = "INSERT INTO wg (wgid, wgname, creationdate) VALUES (?, ?, ?)";
        String testWgUserString = "INSERT INTO users (userid, email, pwd) VALUES (?, ?, ?)";
        String testUserInWgString = "INSERT INTO userallocation (userid, wgid, joindate) VALUES (?, ?, ?)";
        PreparedStatement testWgStmnt = connectionHandler.conn.prepareStatement(testWgString);
        PreparedStatement testWgSetterStmnt = connectionHandler.conn.prepareStatement(testWgString);
        PreparedStatement testWgUserStmnt = connectionHandler.conn.prepareStatement(testWgUserString);
        PreparedStatement testWgUser2Stmnt = connectionHandler.conn.prepareStatement(testWgUserString);
        PreparedStatement testWgUser3Stmnt = connectionHandler.conn.prepareStatement(testWgUserString);
        PreparedStatement testUserInWgStmnt = connectionHandler.conn.prepareStatement(testUserInWgString);
        PreparedStatement testUserInWg2Stmnt = connectionHandler.conn.prepareStatement(testUserInWgString);
        connectionHandler.conn.setAutoCommit(true);

        testWgStmnt.setObject(1, testWgUUID);
        testWgStmnt.setString(2, testWgName);
        testWgStmnt.setDate(3, testWgDate);
        testWgStmnt.execute();

        testWgSetterStmnt.setObject(1, testWgSetterUUID);
        testWgSetterStmnt.setString(2, testWgSetterName);
        testWgSetterStmnt.setDate(3, testWgSetterDate);
        testWgSetterStmnt.execute();

        testWgUserStmnt.setObject(1, testWgUserUUID);
        testWgUserStmnt.setString(2, testWgUserEmail);
        testWgUserStmnt.setString(3, testWgUserPw);
        testWgUserStmnt.execute();

        testWgUser2Stmnt.setObject(1, testWgUser2UUID);
        testWgUser2Stmnt.setString(2, testWgUser2Email);
        testWgUser2Stmnt.setString(3, testWgUser2Pw);
        testWgUser2Stmnt.execute();

        testWgUser3Stmnt.setObject(1, testWgUser3UUID);
        testWgUser3Stmnt.setString(2, testWgUser3Email);
        testWgUser3Stmnt.setString(3, testWgUser3Pw);
        testWgUser3Stmnt.execute();

        testUserInWgStmnt.setObject(1, testWgUserUUID);
        testUserInWgStmnt.setObject(2, testWgUUID);
        testUserInWgStmnt.setDate(3, testWgDate);
        testUserInWgStmnt.execute();

        testUserInWg2Stmnt.setObject(1, testWgUser3UUID);
        testUserInWg2Stmnt.setObject(2, testWgUUID);
        testUserInWg2Stmnt.setDate(3, testWgDate);
        testUserInWg2Stmnt.execute();

        testWgStmnt.close();
        testWgSetterStmnt.close();
        testWgUserStmnt.close();
        testWgUser2Stmnt.close();
        testWgUser3Stmnt.close();
        testUserInWgStmnt.close();
        testUserInWg2Stmnt.close();

        connectionHandler.close();
    }

    @AfterAll
    @Tag("DB")
    static void tearDownAfterClass() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testWgString = "DELETE FROM wg WHERE wgid = ?";
        String testWgUserString = "DELETE FROM users WHERE userid = ?";
        PreparedStatement testWgStmnt = connectionHandler.conn.prepareStatement(testWgString);
        PreparedStatement testWgSetterStmnt = connectionHandler.conn.prepareStatement(testWgString);
        PreparedStatement testWgUserStmnt = connectionHandler.conn.prepareStatement(testWgUserString);
        PreparedStatement testWgUser2Stmnt = connectionHandler.conn.prepareStatement(testWgUserString);
        PreparedStatement testWgUser3Stmnt = connectionHandler.conn.prepareStatement(testWgUserString);
        connectionHandler.conn.setAutoCommit(true);

        testWgStmnt.setObject(1, testWgUUID);
        testWgStmnt.execute();
        testWgStmnt.close();

        testWgSetterStmnt.setObject(1, testWgSetterUUID);
        testWgSetterStmnt.execute();
        testWgSetterStmnt.close();

        testWgUserStmnt.setObject(1, testWgUserUUID);
        testWgUserStmnt.execute();
        testWgUserStmnt.close();

        testWgUser2Stmnt.setObject(1, testWgUser2UUID);
        testWgUser2Stmnt.execute();
        testWgUser2Stmnt.close();

        testWgUser3Stmnt.setObject(1, testWgUser3UUID);
        testWgUser3Stmnt.execute();
        testWgUser3Stmnt.close();

        connectionHandler.close();
    }

    @AfterEach
    @Tag("DB")
    void cleanUpInTestWg() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();
        connectionHandler.conn.setAutoCommit(true);
        if (this.testWgCleanupUUID != null) { // so it doesn't try to delete something that doesn't exist (to safe on DB traffic)
            String testWgCleanupString = "DELETE FROM wg WHERE wgid = ?";
            PreparedStatement testWgCleanupStmnt = connectionHandler.conn.prepareStatement(testWgCleanupString);

            testWgCleanupStmnt.setObject(1, this.testWgCleanupUUID);
            testWgCleanupStmnt.execute();
            testWgCleanupStmnt.close();
        } 

        if (this.testWgShoppingListCleanupUUID != null) { // so it doesn't try to delete something that doesn't exist (to safe on DB traffic)
            String testWgShoppingListCleanupString = "DELETE FROM shoppinglists WHERE shoppinglistid = ?";
            PreparedStatement testWgShoppingListCleanupStmnt = connectionHandler.conn.prepareStatement(testWgShoppingListCleanupString);
        
            testWgShoppingListCleanupStmnt.setObject(1, this.testWgCleanupUUID);
            testWgShoppingListCleanupStmnt.execute();
            testWgShoppingListCleanupStmnt.close();
        }

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testWgConstructorFromUUID() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        WG testWg = new WG(connectionHandler, testWgUUID);

        assertEquals(testWg.getWgID(), testWgUUID);
        assertEquals(testWg.getWgName(), testWgName);
        assertEquals(testWg.getCreationDate(), testWgDate);

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testWgConstructorFromWrongUUID() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        Exception e = assertThrows(SQLException.class, () -> {
            new WG(connectionHandler, UUID.randomUUID());
        });

        assertTrue(e.getMessage().contains("there is no WG with wgID"));
        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testWgConstructorNewWg() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testWgName = "TCWgName2";

        WG testWg = new WG(connectionHandler, testWgName);
        this.testWgCleanupUUID = testWg.getWgID();
        assertEquals(testWg.getWgName(), testWgName);

        WG testWgDB = new WG(connectionHandler, testWg.getWgID());
        assertEquals(testWg.getWgID(), testWgDB.getWgID());
        assertEquals(testWg.getWgName(), testWgDB.getWgName());
        assertEquals(testWg.getCreationDate(), testWgDB.getCreationDate());

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testWgSetter() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testWgNewName = "TCWgNewName";

        WG testWg = new WG(connectionHandler, testWgSetterUUID);

        testWg.setWgName(testWgNewName);
        assertEquals(testWg.getWgName(), testWgNewName);

        WG testWgDB = new WG(connectionHandler, testWg.getWgID());
        assertEquals(testWg.getWgID(), testWgDB.getWgID());
        assertEquals(testWg.getWgName(), testWgDB.getWgName());

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testWgHasUser() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        WG testWg = new WG(connectionHandler, testWgUUID);

        assertTrue(testWg.hasUser(new User(connectionHandler, testWgUserUUID)));

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testWgAddUser() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        WG testWg = new WG(connectionHandler, testWgUUID);

        testWg.addUser(new User(connectionHandler, testWgUser2UUID));
        assertTrue(testWg.hasUser(new User(connectionHandler, testWgUser2UUID)));

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testWgRemoveUser() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        WG testWg = new WG(connectionHandler, testWgUUID);

        testWg.removeUser(new User(connectionHandler, testWgUser3UUID));
        assertFalse(testWg.hasUser(new User(connectionHandler, testWgUser3UUID)));

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testWgShoppingList() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        WG testWg = new WG(connectionHandler, testWgUUID);
        ShoppingList testWgShoppingList = testWg.createList(new User(connectionHandler, testWgUserUUID), testWgShoppingListName);

        String selectListString = "SELECT shoppinglistid, wgid, lastcachedchangeid, listname, creatoruserid FROM shoppinglists WHERE shoppinglistid = ?";
        String selectListChangeString = "SELECT shoppinglistid, change, userid FROM listchanges WHERE listchangeid = ? AND shoppinglistid = ?";
        PreparedStatement selectListStmnt = connectionHandler.conn.prepareStatement(selectListString);
        PreparedStatement selectListChangeStmnt = connectionHandler.conn.prepareStatement(selectListChangeString);
        selectListStmnt.setObject(1, testWgShoppingList.getShoppingListId());
        selectListChangeStmnt.setInt(1, 1);
        selectListChangeStmnt.setObject(2, testWgShoppingList.getShoppingListId());
        ResultSet rsList = selectListStmnt.executeQuery();
        ResultSet rsListChange = selectListChangeStmnt.executeQuery();
        if (rsList.next()) {
            assertEquals((UUID)rsList.getObject("shoppinglistid"), testWgShoppingList.getShoppingListId());
            assertEquals((UUID)rsList.getObject("wgid"), testWg.getWgID());
            assertEquals(rsList.getInt("lastcachedchangeid"), 1);
            assertEquals(rsList.getString("listname"), testWgShoppingListName);
            assertEquals((UUID)rsList.getObject("creatoruserid"), testWgUserUUID);
        } else {
            fail();
        }

        if (rsListChange.next()) {
            assertEquals((UUID)rsListChange.getObject("shoppinglistid"), testWgShoppingList.getShoppingListId());
            assertEquals(rsListChange.getString("change"), "CREATED");
            assertEquals((UUID)rsListChange.getObject("userid"), testWgUserUUID);
        } else {
            fail();
        }

        selectListStmnt.close();
        selectListChangeStmnt.close();

        ArrayList<ShoppingList> testWgShoppingListList = testWg.lists(connectionHandler);
        assertEquals(testWgShoppingListList.size(), 1);
        assertEquals(testWgShoppingListList.get(0).getShoppingListId(), testWgShoppingList.getShoppingListId());

        connectionHandler.close();
    }
}
