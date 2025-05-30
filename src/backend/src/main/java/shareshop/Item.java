package shareshop;

import java.sql.SQLException;
import java.time.LocalDate;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.math.BigDecimal;

public class Item {
    private String itemID;
    private String wgID;
    private int lastCachedCahngeID;
    private String itemName;
    private String itemDescription;
    private BigDecimal price;

    /**
     * Constructor of Class Item
     * @param itemID
     * @param wgID
     * @param lastCachedCahngeID
     * @param itemName
     * @param itemDescription
     * @param price
     */
    public Item(String itemID, String wgID, int lastCachedCahngeID, String itemName, String itemDescription, BigDecimal price) {
        this.itemID = itemID;
        this.wgID = wgID;
        this.lastCachedCahngeID = lastCachedCahngeID;
        this.itemName = itemName;
        this.itemDescription = itemDescription;
        this.price = price;
    }

    /**
     * "generates" the next ID for a new change entry in the itemchanges table
     * @param connectionHandler
     * @return
     * @throws SQLException
     */
    private int newChangeID(DBConnectionHandler connectionHandler) throws SQLException {
        String lastChangesString = new String("SELECT MAX(itemchangeid) FROM itemchanges WHERE itemid = ?");
        PreparedStatement lastChanges = connectionHandler.conn.prepareStatement(lastChangesString);
        lastChanges.setString(1, this.itemID);
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
     * @param connectionHandler
     * @param itemName
     * @throws SQLException
     */
    public void setItemName(DBConnectionHandler connectionHandler, String itemName) throws SQLException {
        String updateString = new String("UPDATE items SET itemname = ? WHERE itemid = ?");
        String itemChangeString = new String("INSERT INTO itemchanges(itemid, itemchangeid, change, changedate, columnchange, itemname) VALUES(?, ?, ?, ?, ?, ?)");
        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                PreparedStatement itemChange = connectionHandler.conn.prepareStatement(itemChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            update.setString(1, itemName);
            update.setString(2, this.itemID);

            itemChange.setString(1, this.itemID);
            itemChange.setInt(2, newChangeID(connectionHandler));
            itemChange.setString(3, "EDITED");
            itemChange.setDate(4, Date.valueOf(LocalDate.now()));
            itemChange.setString(5, "ITEMNAME");
            itemChange.setString(6, itemName);

            connectionHandler.conn.commit();
            update.close();
            itemChange.close();
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
     * @param connectionHandler
     * @param itemDescription
     * @throws SQLException
     */
    public void setItemDescription(DBConnectionHandler connectionHandler, String itemDescription) throws SQLException {
        String updateString = new String("UPDATE items SET itemdescription = ? WHERE itemid = ?");
        String itemChangeString = new String("INSERT INTO itemchanges(itemid, itemchangeid, change, changedate, columnchange, itemdescription) VALUES(?, ?, ?, ?, ?, ?)");
        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                PreparedStatement itemChange = connectionHandler.conn.prepareStatement(itemChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            update.setString(1, itemDescription);
            update.setString(2, this.itemID);

            itemChange.setString(1, this.itemID);
            itemChange.setInt(2, newChangeID(connectionHandler));
            itemChange.setString(3, "EDITED");
            itemChange.setDate(4, Date.valueOf(LocalDate.now()));
            itemChange.setString(5, "ITEMDESCR");
            itemChange.setString(6, itemDescription);

            connectionHandler.conn.commit();
            update.close();
            itemChange.close();
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
     * @param connectionHandler
     * @param price
     * @throws SQLException
     */
    public void setPrice(DBConnectionHandler connectionHandler, BigDecimal price) throws SQLException {
        String updateString = new String("UPDATE items SET price = ? WHERE itemid = ?");
        String itemChangeString = new String("INSERT INTO itemchanges(itemid, itemchangeid, change, changedate, columnchange, price) VALUES(?, ?, ?, ?, ?, ?)");
        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                PreparedStatement itemChange = connectionHandler.conn.prepareStatement(itemChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            update.setBigDecimal(1, price);
            update.setString(2, this.itemID);

            itemChange.setString(1, this.itemID);
            itemChange.setInt(2, newChangeID(connectionHandler));
            itemChange.setString(3, "EDITED");
            itemChange.setDate(4, Date.valueOf(LocalDate.now()));
            itemChange.setString(5, "ITEMPRICE");
            itemChange.setBigDecimal(6, price);

            connectionHandler.conn.commit();
            update.close();
            itemChange.close();
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
    public String getItemID() {return this.itemID;}

    /**
     * get wg ID
     * @return
     */
    public String getWgID() {return this.wgID;}

    /**
     * get last cached change ID
     * @return
     */
    public int getLastCachedChangeID() {return this.lastCachedCahngeID;}

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
     * @param connectionHandler
     * @throws SQLException
     */
    public void remove(DBConnectionHandler connectionHandler) throws SQLException {
        String removeString = new String("DELETE FROM items WHERE itemid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteItem = connectionHandler.conn.prepareStatement(removeString)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteItem.setString(1, this.itemID);
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
