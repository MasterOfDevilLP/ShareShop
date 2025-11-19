package shareshop;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

// Notes: not testing the itemchanges yet, because they are not used currently
// TODO: edit tests to test itemchanges after adding the using of those

/**
 * Test Case Item
 * functions with Tag "DB" need DB connection
 */
public class TCItem {
    private static final UUID testItemUUID = UUID.randomUUID();
    private static final String testItemName = "TCItemName";
    private static final String testItemDescription = "TCItemDescription";
    private static final BigDecimal testItemPrice = BigDecimal.valueOf(621.0);
    private static final UUID testItemSetterUUID = UUID.randomUUID();
    private static final String testItemSetterName = "TCItemSetterName";
    private static final String testItemSetterDescription = "TCItemSetterDescription";
    private static final BigDecimal testItemSetterPrice = BigDecimal.valueOf(621.0);
    private static final UUID testItemRemoveUUID = UUID.randomUUID();
    private static final String testItemRemoveName = "TCItemRemoveName";
    private static final String testItemRemoveDescription = "TCItemRemoveDescription";
    private static final BigDecimal testItemRemovePrice = new BigDecimal(621.0);
    private static final UUID testItemWgUUID = UUID.randomUUID();
    private static final String testItemWgName = "TCItemWG";
    private static final Date testItemWgCreationDate = Date.valueOf(LocalDate.now());
    private static WG testItemWG;
    private UUID testItemCleanupUUID = null;
    
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

        testItemWG = new WG(connectionHandler, testItemWgUUID, testItemWgName, testItemWgCreationDate);

        String testItemWGString = "INSERT INTO wg (wgid, wgname, creationdate) VALUES (?, ?, ?)";
        String testItemString = "INSERT INTO items (itemid, wgid, itemname, itemdescription, price) VALUES (?, ?, ?, ?, ?)";
        PreparedStatement testItemWGStmnt = connectionHandler.conn.prepareStatement(testItemWGString);
        PreparedStatement testItemStmnt = connectionHandler.conn.prepareStatement(testItemString);
        PreparedStatement testItemRemoveStmnt = connectionHandler.conn.prepareStatement(testItemString);
        PreparedStatement testItemSetterStmnt = connectionHandler.conn.prepareStatement(testItemString);
        connectionHandler.conn.setAutoCommit(true);

        testItemWGStmnt.setObject(1, testItemWgUUID);
        testItemWGStmnt.setString(2, testItemWgName);
        testItemWGStmnt.setDate(3, testItemWgCreationDate);
        testItemWGStmnt.execute();

        testItemStmnt.setObject(1, testItemUUID);
        testItemStmnt.setObject(2, testItemWgUUID);
        testItemStmnt.setString(3, testItemName);
        testItemStmnt.setString(4, testItemDescription);
        testItemStmnt.setBigDecimal(5, testItemPrice);
        testItemStmnt.execute();

        testItemRemoveStmnt.setObject(1, testItemRemoveUUID);
        testItemRemoveStmnt.setObject(2, testItemWgUUID);
        testItemRemoveStmnt.setString(3, testItemRemoveName);
        testItemRemoveStmnt.setString(4, testItemRemoveDescription);
        testItemRemoveStmnt.setBigDecimal(5, testItemRemovePrice);
        testItemRemoveStmnt.execute();

        testItemSetterStmnt.setObject(1, testItemSetterUUID);
        testItemSetterStmnt.setObject(2, testItemWgUUID);
        testItemSetterStmnt.setString(3, testItemSetterName);
        testItemSetterStmnt.setString(4, testItemSetterDescription);
        testItemSetterStmnt.setBigDecimal(5, testItemSetterPrice);
        testItemSetterStmnt.execute();

        testItemWGStmnt.close();
        testItemStmnt.close();
        testItemRemoveStmnt.close();
        testItemSetterStmnt.close();

        connectionHandler.close();
    }

    @AfterAll
    @Tag("DB")
    static void tearDownAfterClass() throws SQLException {
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testItemWGString = "DELETE FROM wg WHERE wgid = ?";
        String testItemString = "DELETE FROM items WHERE itemid = ?";
        PreparedStatement testItemWGStmnt = connectionHandler.conn.prepareStatement(testItemWGString);
        PreparedStatement testItemStmnt = connectionHandler.conn.prepareStatement(testItemString);
        PreparedStatement testItemRemoveStmnt = connectionHandler.conn.prepareStatement(testItemString);
        PreparedStatement testItemSetterStmnt = connectionHandler.conn.prepareStatement(testItemString);
        connectionHandler.conn.setAutoCommit(true);

        testItemStmnt.setObject(1, testItemUUID);
        testItemStmnt.execute();
        testItemStmnt.close();

        testItemRemoveStmnt.setObject(1, testItemRemoveUUID);
        testItemRemoveStmnt.execute();
        testItemRemoveStmnt.close();

        testItemSetterStmnt.setObject(1, testItemSetterUUID);
        testItemSetterStmnt.execute();
        testItemSetterStmnt.close();

        testItemWGStmnt.setObject(1, testItemWgUUID);
        testItemWGStmnt.execute();
        testItemWGStmnt.close();

        connectionHandler.close();
    }

    @AfterEach
    @Tag("DB")
    void cleanUpInTestItems() throws SQLException {
        if (this.testItemCleanupUUID == null) {return;} // so it doesn't try to delete something that doesn't exist (to safe on DB traffic)
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testItemCleanupString = "DELETE FROM items WHERE itemid = ?";
        PreparedStatement testItemCleanupStmnt = connectionHandler.conn.prepareStatement(testItemCleanupString);

        testItemCleanupStmnt.setObject(1, this.testItemCleanupUUID);
        testItemCleanupStmnt.execute();
        testItemCleanupStmnt.close();

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testItemConstructorFromUUID() throws SQLException {
        // preparing
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        // acting
        Item testItem = new Item(connectionHandler, testItemUUID);

        // validating
        assertEquals(testItem.getItemID(), testItemUUID);
        assertEquals(testItem.getWgID(), testItemWgUUID);
        assertEquals(testItem.getItemName(), testItemName);
        assertEquals(testItem.getItemDescription(), testItemDescription);
        assertEquals(testItem.getPriceAsDouble(), testItemPrice.doubleValue());

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testUserConstructorFromWrongUUID() throws SQLException {
        // preparing
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        // acting and validating
        Exception e = assertThrows(SQLException.class, () -> {
            new Item(connectionHandler, UUID.randomUUID());
        });

        assertTrue(e.getMessage().contains("there is no item with itemID"));
        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testItemConstructorNewItem() throws SQLException {
        // preparing
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testItemName = "TCItemName2";
        String testItemDescription = "TCItemDescription2";
        BigDecimal testItemPrice = new BigDecimal(3621.0);

        // acting
        Item testItem = new Item(connectionHandler, testItemWG, testItemName, testItemDescription, testItemPrice);
        this.testItemCleanupUUID = testItem.getItemID();
        Item testItemDB = new Item(connectionHandler, testItem.getItemID());
        
        // validating
        assertEquals(testItem.getWgID(), testItemWG.getWgID());
        assertEquals(testItem.getItemName(), testItemName);
        assertEquals(testItem.getItemDescription(), testItemDescription);
        assertEquals(testItem.getPriceAsDouble(), testItemPrice.doubleValue());

        assertEquals(testItem.getWgID(), testItemDB.getWgID());
        assertEquals(testItem.getItemName(), testItemDB.getItemName());
        assertEquals(testItem.getItemDescription(), testItemDB.getItemDescription());
        assertEquals(testItem.getPriceAsDouble(), testItemDB.getPriceAsDouble());

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testItemSetter() throws SQLException {
        // preparing
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        String testItemNewName = "TCItemNewName";
        String testItemNewDescription = "TCItemNewDescription";
        BigDecimal testItemNewPrice = new BigDecimal(3621.0);

        // acting
        Item testItem = new Item(connectionHandler, testItemSetterUUID);
        testItem.setItemName(testItemNewName);
        testItem.setItemDescription(testItemNewDescription);
        testItem.setPrice(testItemNewPrice);
        Item testItemDB = new Item(connectionHandler, testItemSetterUUID);
        
        // validating
        assertEquals(testItem.getWgID(), testItemWG.getWgID());
        assertEquals(testItem.getItemName(), testItemNewName);
        assertEquals(testItem.getItemDescription(), testItemNewDescription);
        assertEquals(testItem.getPriceAsDouble(), testItemNewPrice.doubleValue());

        assertEquals(testItem.getWgID(), testItemDB.getWgID());
        assertEquals(testItem.getItemName(), testItemDB.getItemName());
        assertEquals(testItem.getItemDescription(), testItemDB.getItemDescription());
        assertEquals(testItem.getPriceAsDouble(), testItemDB.getPriceAsDouble());

        connectionHandler.close();
    }

    @Test
    @Tag("DB")
    void testItemRemove() throws SQLException {
        // preparing
        DBConnectionHandler connectionHandler = getDBconnection();
        connectionHandler.makeSureItsOpen();

        // acting
        Item testItem = new Item(connectionHandler, testItemRemoveUUID, testItemWgUUID, 0, null, null, null);
        testItem.remove();

        // validating
        Exception e = assertThrows(SQLException.class, () -> {
            new Item(connectionHandler, testItemRemoveUUID);
        });

        assertTrue(e.getMessage().contains("there is no item with itemID"));
        connectionHandler.close();
    }
}
