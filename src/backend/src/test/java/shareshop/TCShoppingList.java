package shareshop;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

import org.javatuples.Pair;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import net.bytebuddy.asm.Advice.Local;

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
    private static ShoppingList testListNaming;
    private static final String testListItemName1 = "TCListItem1";
    private static final String testListItemDescription1 = "TCListItemDesc1";
    private static final BigDecimal testListItemPrice1 = new BigDecimal(621.0);
    private static final int testListItemAmount = 4;
    private static Item testListItem1;
    private static final String testListItemName2 = "TCListItem2";
    private static final String testListItemDescription2 = "TCListItemDesc2";
    private static final BigDecimal testListItemPrice2 = new BigDecimal(621.0);
    private static Item testListItem2;
    

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

        WG testListWg = new WG(connectionHandler, testListWgUUID);
        User testListUser = new User(connectionHandler, testListUserUUID);
        testList = testListWg.createList(testListUser, testListName);
        testListUUID = testList.getShoppingListId();
        
        testListNaming = testListWg.createList(testListUser, "nope");
        testListItem1 = new Item(connectionHandler, testListWg, testListItemName1, testListItemDescription1, testListItemPrice1);
        testListItem2 = new Item(connectionHandler, testListWg, testListItemName2, testListItemDescription2, testListItemPrice2);
        
        testList.addChange(testListUser, testListItem1, ShoppingList.Change.ADD, testListItemAmount);

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

        testListNaming.remove();
        
        testListStmnt.setObject(1, testListUUID);
        testListStmnt.execute();
        testListStmnt.close();
        
        testListItem1.remove();
        testListItem2.remove();

        testListWgStmnt.setObject(1, testListWgUUID);
        testListWgStmnt.execute();
        testListWgStmnt.close();

        testListUserStmnt.setObject(1, testListUserUUID);
        testListUserStmnt.execute();
        testListUserStmnt.close();

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testListSetName() throws SQLException {
        // preparing
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        User testListUser = new User(connectionHandler, testListUserUUID);
        String testListNewName = "newListName";

        // using
        testListNaming.setListName(testListNewName, testListUser);
        
        // testing
        ShoppingList testListNamingDB = new ShoppingList(connectionHandler, testListNaming.getShoppingListId());
        assertEquals(testListNaming.getShoppingListId(), testListNamingDB.getShoppingListId());
        assertEquals(testListNaming.getName(), testListNamingDB.getName());

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testListGetItems() throws SQLException {
        // preparing
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        // using
        ArrayList<Pair<Item, Integer>> testListItems = testList.getItemsOnList();

        // testing
        assertEquals(1, testListItems.size());
        assertEquals(testListItem1.getItemID(), testListItems.get(0).getValue0().getItemID());
        assertEquals(testListItemAmount, testListItems.get(0).getValue1().intValue());

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testListChanges() throws SQLException {
        // preparing
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        User testListUser = new User(connectionHandler, testListUserUUID);

        // using
        testListNaming.addChange(testListUser, testListItem2, ShoppingList.Change.ADD, 5);
        ArrayList<Pair<Item, Integer>> testListItems = testListNaming.getItemsOnList();
        ArrayList<ListChange> testListChanges = testListNaming.getChangeLog(0, 9);

        // testing
        assertEquals(1, testListItems.size());
        assertEquals(5, testListItems.get(0).getValue1().intValue());
        assertEquals(2, testListChanges.size());
        assertEquals(ListChange.ChangeEnum.ADDED, testListChanges.get(1).getChange());

        connectionHandler.close();
    }
}
