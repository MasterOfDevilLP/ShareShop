package shareshop;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.UUID;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.math.BigDecimal;

public class Item {
    private DBConnectionHandler connectionHandler;
    private UUID itemID;
    private UUID wgID;
    private int lastCachedChangeID;
    private String itemName;
    private String itemDescription;
    private BigDecimal price;

    /**
     * Constructor of Class Item
     * @param connectionHandler
     * @param itemID
     * @param wgID
     * @param lastCachedChangeID
     * @param itemName
     * @param itemDescription
     * @param price
     */
    public Item(DBConnectionHandler connectionHandler, UUID itemID, UUID wgID, int lastCachedChangeID, String itemName, String itemDescription, BigDecimal price) {
        this.connectionHandler = connectionHandler;
        this.itemID = itemID;
        this.wgID = wgID;
        this.lastCachedChangeID = lastCachedChangeID;
        this.itemName = itemName;
        this.itemDescription = itemDescription;
        this.price = price;
    }

    // doesn't override the generic equals method, as this doesn't compare everything, only the IDs (which is good enough for most usecases)
    public boolean equals(Item item) {
    	if(item == null) {
    		return false;
    	}
    	if(itemID.equals(item.getItemID()) && wgID.equals(item.getWgID())) {
    		return true;
    	}
    	return false;
    }
    
    /**
     * Constructor of Class Item via the itemID and a DB query
     * @param connectionHandler
     * @param itemID
     * @throws SQLException
     */
    public Item(DBConnectionHandler connectionHandler, UUID itemID) throws SQLException {
        this.connectionHandler = connectionHandler;
        String selectString = new String ("SELECT wgid, lastcachedchangeid, itemname, itemdescription, CAST(price AS NUMERIC) AS price FROM items WHERE itemid = ?");
        connectionHandler.makeSureItsOpen();
        connectionHandler.conn.setAutoCommit(true);
        PreparedStatement select = connectionHandler.conn.prepareStatement(selectString);
        select.setObject(1, itemID);
        ResultSet rs = select.executeQuery();
        if (rs.next()) {
            this.itemID = itemID;
            this.wgID = (UUID)rs.getObject("wgid");
            this.lastCachedChangeID = rs.getInt("lastcachedchangeid");
            this.itemName = rs.getString("itemname");
            this.itemDescription = rs.getString("itemdescription");
            this.price = rs.getBigDecimal("price");
            select.close();
        } else {
            select.close();
            throw new SQLException("there is no item with itemID: " + itemID);
        }
    }
    
    // create a new Item
    // TODO: create an initial change entry as well
    public Item(DBConnectionHandler connectionHandler, WG wg, String name, String description, BigDecimal price) throws SQLException {
        this.connectionHandler = connectionHandler;
    	String statementStr = "INSERT INTO items (itemid, wgid, itemname, itemdescription, price) VALUES (?, ?, ?, ?, ?)";
        connectionHandler.makeSureItsOpen();
        connectionHandler.conn.setAutoCommit(true);
    	PreparedStatement statement = connectionHandler.conn.prepareStatement(statementStr);
    	UUID iid = UUID.randomUUID();
    	try {
    		statement.setObject(1, iid);
    		statement.setObject(2, wg.getWgID());
    		statement.setString(3, name);
    		statement.setString(4, description);
    		statement.setBigDecimal(5, price);
    		statement.execute();
    		statement.close();
    		this.itemID = iid;
    		this.wgID = wg.getWgID();
    		this.itemName = name;
    		this.itemDescription = description;
    		this.price = price;
    	} catch(SQLException e) {
    		connectionHandler.conn.rollback();
    		throw e;
    	}
    	
    }

    /**
     * "generates" the next ID for a new change entry in the itemchanges table
     * @return
     * @throws SQLException
     */
    private int newChangeID() throws SQLException {
        String lastChangesString = new String("SELECT MAX(itemchangeid) FROM itemchanges WHERE itemid = ?");
        connectionHandler.makeSureItsOpen();
        connectionHandler.conn.setAutoCommit(true);
        PreparedStatement lastChanges = connectionHandler.conn.prepareStatement(lastChangesString);
        lastChanges.setObject(1, this.itemID);
        ResultSet rs = lastChanges.executeQuery();
        if (rs.next()) {
            int newID = rs.getInt(1) + 1;
            lastChanges.close();
            return newID;
        }
        lastChanges.close();
        return 0;
    }

    /**
     * update item name
     * @param itemName
     * @throws SQLException
     */
    public void setItemName(String itemName) throws SQLException {
        String updateString = new String("UPDATE items SET itemname = ? WHERE itemid = ?");
        String itemChangeString = new String("INSERT INTO itemchanges(itemid, itemchangeid, change, changedate, columnchange, itemname) VALUES(?, ?, ?, ?, ?, ?)");
        connectionHandler.makeSureItsOpen();
        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                PreparedStatement itemChange = connectionHandler.conn.prepareStatement(itemChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            update.setString(1, itemName);
            update.setObject(2, this.itemID);
            update.executeUpdate();

            itemChange.setObject(1, this.itemID);
            itemChange.setInt(2, newChangeID());
            itemChange.setString(3, "EDITED");
            itemChange.setDate(4, Date.valueOf(LocalDate.now()));
            itemChange.setString(5, "ITEMNAME");
            itemChange.setString(6, itemName);
            itemChange.execute();

            connectionHandler.conn.commit();
            update.close();
            itemChange.close();
            this.itemName = itemName;
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            if (connectionHandler.conn != null) {
                System.err.println("Transaction failed, rolling back...");
                connectionHandler.conn.rollback();
            }
        }
    }

    /**
     * update item description
     * @param itemDescription
     * @throws SQLException
     */
    public void setItemDescription(String itemDescription) throws SQLException {
        String updateString = new String("UPDATE items SET itemdescription = ? WHERE itemid = ?");
        String itemChangeString = new String("INSERT INTO itemchanges(itemid, itemchangeid, change, changedate, columnchange, itemdescription) VALUES(?, ?, ?, ?, ?, ?)");
        connectionHandler.makeSureItsOpen();
        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                PreparedStatement itemChange = connectionHandler.conn.prepareStatement(itemChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            update.setString(1, itemDescription);
            update.setObject(2, this.itemID);
            update.executeUpdate();

            itemChange.setObject(1, this.itemID);
            itemChange.setInt(2, newChangeID());
            itemChange.setString(3, "EDITED");
            itemChange.setDate(4, Date.valueOf(LocalDate.now()));
            itemChange.setString(5, "ITEMDESCR");
            itemChange.setString(6, itemDescription);
            itemChange.execute();

            connectionHandler.conn.commit();
            update.close();
            itemChange.close();
            this.itemDescription = itemDescription;
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            if (connectionHandler.conn != null) {
                System.err.println("Transaction failed, rolling back...");
                connectionHandler.conn.rollback();
            }
        }
    }

    /**
     * update price
     * @param price
     * @throws SQLException
     */
    public void setPrice(BigDecimal price) throws SQLException {
        String updateString = new String("UPDATE items SET price = ? WHERE itemid = ?");
        String itemChangeString = new String("INSERT INTO itemchanges(itemid, itemchangeid, change, changedate, columnchange, price) VALUES(?, ?, ?, ?, ?, ?)");
        connectionHandler.makeSureItsOpen();
        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                PreparedStatement itemChange = connectionHandler.conn.prepareStatement(itemChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            update.setBigDecimal(1, price);
            update.setObject(2, this.itemID);
            update.executeUpdate();

            itemChange.setObject(1, this.itemID);
            itemChange.setInt(2, newChangeID());
            itemChange.setString(3, "EDITED");
            itemChange.setDate(4, Date.valueOf(LocalDate.now()));
            itemChange.setString(5, "ITEMPRICE");
            itemChange.setBigDecimal(6, price);
            itemChange.execute();

            connectionHandler.conn.commit();
            update.close();
            itemChange.close();
            this.price = price;
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            if (connectionHandler.conn != null) {
                System.err.println("Transaction failed, rolling back...");
                connectionHandler.conn.rollback();
            }
        }
    }

    /**
     * get item ID
     * @return
     */
    public UUID getItemID() {return this.itemID;}

    /**
     * get wg ID
     * @return
     */
    public UUID getWgID() {return this.wgID;}

    /**
     * get last cached change ID
     * @return
     */
    public int getLastCachedChangeID() {return this.lastCachedChangeID;}

    /**
     * get item name
     * @return
     */
    public String getItemName() {return this.itemName;}

    /**
     * get item description
     * @return
     */
    public String getItemDescription() {return this.itemDescription;}

    /**
     * get price
     * @return
     */
    public BigDecimal getPrice() {return this.price;}

    /**
     * get price as double
     * @return
     */
    public double getPriceAsDouble() {return this.price.doubleValue();}

    /**
     * removes the item from the database
     * @throws SQLException
     */
    public void remove() throws SQLException {
        String removeString = new String("DELETE FROM items WHERE itemid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteItem = connectionHandler.conn.prepareStatement(removeString)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteItem.setObject(1, this.itemID);
            deleteItem.executeUpdate();
            connectionHandler.conn.commit();
            deleteItem.close();
        } catch (SQLException e)
        {
            System.err.println(e.getMessage());
            if (connectionHandler.conn != null) {
                System.err.println("Transaction failed, rolling back...");
                connectionHandler.conn.rollback();
            }
        }
    }
}
