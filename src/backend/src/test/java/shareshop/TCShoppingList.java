package shareshop;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

public class TCShoppingList {
    private static final UUID testListWgUUID = UUID.randomUUID();
    private static final String testListWgName = "TCListWG";
    private static final Date testListWgDate = Date.valueOf(LocalDate.now());
    private static final UUID testListUserUUID = UUID.randomUUID();
    private static final String testListUserEmail = "TCListUser@test.test";
    private static final String testListUserPw = "TCListUserPw";
    private static final String testListName = "TestList";
    private static UUID testListUUID;
    private static ShoppingList testList;
    

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

        String testListWgString = "INSERT INTO wg (wgid, wgname, creationdate) VALUES (?, ?, ?)";
        String testListUserString = "INSERT INTO users (userid, email, pwd) VALUES (?, ?, ?)";
        PreparedStatement testListWgStmnt = connectionHandler.conn.prepareStatement(testListWgString);
        PreparedStatement testListUserStmnt = connectionHandler.conn.prepareStatement(testListUserString);
        connectionHandler.conn.setAutoCommit(true);

        testListWgStmnt.setObject(1, testListWgUUID);
        testListWgStmnt.setString(2, testListWgName);
        testListWgStmnt.setDate(3, testListWgDate);
        testListWgStmnt.execute();

        testListUserStmnt.setObject(1, testListUserUUID);
        testListUserStmnt.setString(2, testListUserEmail);
        testListUserStmnt.setString(3, testListUserPw);
        testListUserStmnt.execute();

        testListWgStmnt.close();
        testListUserStmnt.close();

        testList = new WG(connectionHandler, testListWgUUID).createList(new User(connectionHandler, testListUserUUID), testListName);
        testListUUID = testList.getShoppingListId();

        connectionHandler.close();
    }

    @AfterAll
    @Tag("DB")
    static void tearDownAfterClass() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testListWgString = "DELETE FROM wg WHERE wgid = ?";
        String testListUserString = "DELETE FROM users WHERE userid = ?";
        String testListString = "DELETE FROM shoppinglists WHERE shoppinglistid = ?";
        PreparedStatement testListWgStmnt = connectionHandler.conn.prepareStatement(testListWgString);
        PreparedStatement testListUserStmnt = connectionHandler.conn.prepareStatement(testListUserString);
        PreparedStatement testListStmnt = connectionHandler.conn.prepareStatement(testListString);
        connectionHandler.conn.setAutoCommit(true);

        testListStmnt.setObject(1, testListUUID);
        testListStmnt.execute();
        testListStmnt.close();

        testListWgStmnt.setObject(1, testListWgUUID);
        testListWgStmnt.execute();
        testListWgStmnt.close();

        testListUserStmnt.setObject(1, testListUserUUID);
        testListUserStmnt.execute();
        testListUserStmnt.close();

        connectionHandler.close();
    }

    @Test
    void test() {
        assertTrue(true);
    }
}
