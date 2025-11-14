package shareshop;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.nullable;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import shareshop.User;
import shareshop.ConfigLoader;
import shareshop.Config;

// notiz an mich selbst:
// Objekte nicht mocken sondern in BeforeAll mit eigenen queries auf der Datenbank aufsetzen
// beim testen vom schreiben auf die Datenbank dann selber mit queries testen (oder abfrage funktionen vorher testen und als abhängigkeit einstellen)

// TODO: check if VM still crashes on 'docker compose build backend'

/**
 * Test Case User
 * functions with Tag "DB" need DB connection
 */
public class TCUser {
    private static final UUID testUserUUID = UUID.randomUUID();
    private static final String testUserEmail = new String("TCUser@test.test");
    private static final String testUserPw = new String("TCUserTestPW");
    private static final UUID testUserRemoveUUID = UUID.randomUUID();
    private static final String testUserRemoveEmail = new String("TCUserRemove@test.test");
    private static final String testUserRemovePw = new String("TCUserTestPW");
    private static final UUID testUserWgUUID = UUID.randomUUID();
    private static final String testUserWgName = new String("TCUserWgTestName");
    private static final Date testUserWgCreationDate = Date.valueOf(LocalDate.now());
    private UUID testUserCleanupUUID = null;

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

        // setting up objects in DB
        try {
            connectionHandler.makeSureItsOpen();
            String testUserString = "INSERT INTO users (userid, email, pwd) VALUES (?, ?, ?)";
            String testWGString = "INSERT INTO wg (wgid, wgname, creationdate) VALUES (?, ?, ?)";
            String testUserInWgString = "INSERT INTO userallocation (userid, wgid, joindate) VALUES (?, ?, ?)";
            PreparedStatement testUserStmnt = connectionHandler.conn.prepareStatement(testUserString);
            PreparedStatement testUserRemoveStmnt = connectionHandler.conn.prepareStatement(testUserString);
            PreparedStatement testWgStmnt = connectionHandler.conn.prepareStatement(testWGString);
            PreparedStatement testUserInWgStmnt = connectionHandler.conn.prepareStatement(testUserInWgString);
            connectionHandler.conn.setAutoCommit(true);

            testUserStmnt.setObject(1, testUserUUID);
            testUserStmnt.setString(2, testUserEmail);
            testUserStmnt.setString(3, testUserPw);
            testUserStmnt.execute();

            testUserRemoveStmnt.setObject(1, testUserRemoveUUID);
            testUserRemoveStmnt.setString(2, testUserRemoveEmail);
            testUserRemoveStmnt.setString(3, testUserRemovePw);
            testUserRemoveStmnt.execute();

            testWgStmnt.setObject(1, testUserWgUUID);
            testWgStmnt.setString(2, testUserWgName);
            testWgStmnt.setDate(3, testUserWgCreationDate);
            testWgStmnt.execute();

            testUserInWgStmnt.setObject(1, testUserUUID);
            testUserInWgStmnt.setObject(2, testUserWgUUID);
            testUserInWgStmnt.setDate(3, testUserWgCreationDate);
            testUserInWgStmnt.execute();

            testUserStmnt.close();
            testUserRemoveStmnt.close();
            testWgStmnt.close();
            testUserInWgStmnt.close();
        } catch (SQLException e) {
            e.printStackTrace();
            throw(e);
        }

        connectionHandler.close();
    }

    @AfterAll
    @Tag("DB")
    static void tearDownAfterClass() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();
        String testUserString = "DELETE FROM users WHERE userid = ?";
        String testWgString = "DELETE FROM wg WHERE wgid = ?";
        PreparedStatement testUserStmnt = connectionHandler.conn.prepareStatement(testUserString);
        PreparedStatement testUserRemoveStmnt = connectionHandler.conn.prepareStatement(testUserString);
        PreparedStatement testWgStmnt = connectionHandler.conn.prepareStatement(testWgString);
        connectionHandler.conn.setAutoCommit(true);

        testUserStmnt.setObject(1, testUserUUID);
        testUserStmnt.execute();
        testUserStmnt.close();

        testUserRemoveStmnt.setObject(1, testUserRemoveUUID);
        testUserRemoveStmnt.execute();
        testUserRemoveStmnt.close();

        testWgStmnt.setObject(1, testUserWgUUID);
        testWgStmnt.execute();
        testWgStmnt.close();

        connectionHandler.close();
    }

    @AfterEach
    @Tag("DB")
    void cleanUpInTestUsers() throws SQLException {
        if (this.testUserCleanupUUID == null) {return;} // so it doesn't try to delete something that doesn't exist (to safe on DB traffic)
        DBConnectionHandler connectionHandler = getDBconnection();

        // cleanup of in test created Users
        String testUserCleanupString = "DELETE FROM users WHERE userid = ?";
        PreparedStatement testUserCleanupStmnt = connectionHandler.conn.prepareStatement(testUserCleanupString);
        connectionHandler.conn.setAutoCommit(true);
        testUserCleanupStmnt.setObject(1, this.testUserCleanupUUID);
        testUserCleanupStmnt.execute();
        testUserCleanupStmnt.close();

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testUserConstructorFromUUID() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();
        User testUser = new User(connectionHandler, testUserUUID);
        assertTrue(testUser.getUserID().equals(testUserUUID));
        assertTrue(testUser.getEmail().equals(testUserEmail));
        assertTrue(testUser.getPassword().equals(testUserPw));
        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testUserConstructorFromWrongUUID() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        Exception e = assertThrows(SQLException.class, () -> {
            new User(connectionHandler, UUID.randomUUID());
        });

        assertTrue(e.getMessage().contains("there is no user with userID"));
        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testUserConstructorNewUser() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();
        String testEmail = "TCUser2@test.test";
        String testPw = "TCUserTestPW";
        User testUser = new User(connectionHandler, testEmail, testPw);
        this.testUserCleanupUUID = testUser.getUserID();
        assertTrue(testUser.getEmail().equals(testEmail));
        assertTrue(testUser.getPassword().equals(testPw));

        User testUserDB = new User(connectionHandler, testUser.getUserID());
        assertTrue(testUserDB.getUserID().equals(testUser.getUserID()));
        assertTrue(testUserDB.getEmail().equals(testEmail));
        assertTrue(testUserDB.getPassword().equals(testPw));

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testUserGetWgList() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();
        User testUser = new User(connectionHandler, testUserUUID);
        ArrayList<UUID> wgList = testUser.getWgIDList();
        assertEquals(1, wgList.size());
        assertTrue(wgList.get(0).equals(testUserWgUUID));
        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testUserInWg() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();
        User testUser = new User(connectionHandler, testUserUUID);
        assertTrue(testUser.isUserInWG(testUserWgUUID));
        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testUserRemove() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();
        User testUser = new User(connectionHandler, testUserRemoveUUID);
        testUser.remove();
        
        Exception e = assertThrows(SQLException.class, () -> {
            new User(connectionHandler, testUserRemoveUUID);
        });

        assertTrue(e.getMessage().contains("there is no user with userID"));
        connectionHandler.close();
    }
}