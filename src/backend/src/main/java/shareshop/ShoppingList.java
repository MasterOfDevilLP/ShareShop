package shareshop;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;

import org.javatuples.Pair;

public class ShoppingList {
    private String shoppingListID;
    private String wgID;
    private int lastCachedCahngeID;
    private Date creationDate;
    private String listName;
    private String creatorUserID;
    private ArrayList<ItemAllocation> itemAllocations;

    protected class ItemAllocation {
        private Item item;
        private String shoppingListID;
        private Date creationDate;
        private int amount;

        /**
         * Constructor of Class ItemAllocation
         * @param item
         * @param shoppingListID
         * @param creationDate
         * @param amount
         */
        public ItemAllocation(Item item, String shoppingListID, Date creationDate, int amount) {
            this.item = item;
            this.shoppingListID = shoppingListID;
            this.creationDate = creationDate;
            this.amount = amount;
        }

        /**
         * "generates" the next ID for a new change entry in the listchanges table
         * @param connectionHandler
         * @return the next ID for a new change entry
         * @throws SQLException
         */
        private int newChangeID(DBConnectionHandler connectionHandler) throws SQLException {
            String lastChangesString = new String("SELECT MAX(listchangeid) FROM listchanges WHERE shoppinglistid = ?");
            PreparedStatement lastChanges = connectionHandler.conn.prepareStatement(lastChangesString);
            lastChanges.setString(1, this.shoppingListID);
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
         * update amount in item allocation
         * @param connectionHandler
         * @param amount
         * @throws SQLException
         */
        public void setAmount(DBConnectionHandler connectionHandler, int amount) throws SQLException {
            String updateString = new String("UPDATE itemallocation SET amount = ? WHERE itemid = ? AND shoppinglistid = ?");
            String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, itemid, amount) VALUES(?, ?, ?, ?, ?, ?)");
            try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                    PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
                connectionHandler.conn.setAutoCommit(false);

                update.setInt(1, amount);
                update.setString(2, this.item.getItemID());
                update.setString(3, this.shoppingListID);

                listChange.setString(1, this.shoppingListID);
                listChange.setInt(2, newChangeID(connectionHandler));
                listChange.setString(3, "EDITED");
                listChange.setDate(4, Date.valueOf(LocalDate.now()));
                listChange.setString(5, this.item.getItemID());
                listChange.setInt(6, amount);

                connectionHandler.conn.commit();
                update.close();
                listChange.close();
                this.amount = amount;
            } catch (SQLException e) {
                System.err.println(e.getMessage());
                if (connectionHandler.conn != null) {
                    System.err.println("Transaction failed, rolling back...");
                    connectionHandler.conn.rollback();
                }
            }
        }

        /**
         * get item
         * @return the item of this allocation
         */
        public Item getItem() {return this.item;}

        /**
         * get shopping list ID
         * @return the ID of the list of this allocation
         */
        public String getShoppingListID() {return this.shoppingListID;}

        /**
         * get creation date
         * @return when the allocation got created
         */
        public Date getCreationDate() {return this.creationDate;}

        /**
         * get amount
         * @return the amount of the item on the list
         */
        public int getAmount() {return this.amount;}
    }

    /**
     * Constructor of Class ShoppingList
     * @param shoppingListID
     * @param wgID
     * @param lastCachedCahngeID
     * @param creationDate
     * @param listName
     * @param creatorUserID
     */
    public ShoppingList(String shoppingListID, String wgID, int lastCachedCahngeID, Date creationDate, String listName, String creatorUserID) {
        this.shoppingListID = shoppingListID;
        this.wgID = wgID;
        this.lastCachedCahngeID = lastCachedCahngeID;
        this.creationDate = creationDate;
        this.listName = listName;
        this.creatorUserID = creatorUserID;
        this.itemAllocations = new ArrayList<ItemAllocation>();
    }

    /**
     * "generates" the next ID for a new change entry in the listchanges table
     * @param connectionHandler
     * @return the next ID for a new change entry
     * @throws SQLException
     */
    private int newChangeID(DBConnectionHandler connectionHandler) throws SQLException {
        String lastChangesString = new String("SELECT MAX(listchangeid) FROM listchanges WHERE shoppinglistid = ?");
        PreparedStatement lastChanges = connectionHandler.conn.prepareStatement(lastChangesString);
        lastChanges.setString(1, this.shoppingListID);
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
     * update list name
     * @param connectionHandler
     * @param listName
     * @throws SQLException
     */
    public void setListName(DBConnectionHandler connectionHandler, String listName) throws SQLException {
        String updateString = new String("UPDATE shoppinglists SET listname = ? WHERE shoppinglistid = ?");
        String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, listname) VALUES(?, ?, ?, ?, ?)");
        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            update.setString(1, listName);
            update.setString(2, this.shoppingListID);

            listChange.setString(1, this.shoppingListID);
            listChange.setInt(2, newChangeID(connectionHandler));
            listChange.setString(3, "EDITED");
            listChange.setDate(4, Date.valueOf(LocalDate.now()));
            listChange.setString(5, listName);

            connectionHandler.conn.commit();
            update.close();
            listChange.close();
            this.listName = listName;
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            if (connectionHandler.conn != null) {
                System.err.println("Transaction failed, rolling back...");
                connectionHandler.conn.rollback();
            }
        }
    }

    /**
     * get all items and their amounts that are on the list
     * @return An array of Items and their amount on the list
     */
    public ArrayList<Pair<Item, Integer>> getItemsOnList() {
        ArrayList<Pair<Item, Integer>> items = new ArrayList<>();
        for (ItemAllocation itemAllocation : itemAllocations) {
            items.add(new Pair<Item,Integer>(itemAllocation.getItem(), itemAllocation.getAmount()));
        }
        return items;
    }

    // TODO: addChange(user, change, ...) -> change is an enum
    // TODO: possible changes: ADD (amt), REMOVE (amt), TICK (amt, price)
    // TODO: Column for userid in listchanges

    /**
     * removes the Shoppinglist from the database
     * @param connectionHandler
     * @throws SQLException
     */
    public void remove(DBConnectionHandler connectionHandler) throws SQLException {
        String removeString = new String("DELETE FROM shoppinglists WHERE shoppinglistid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteList = connectionHandler.conn.prepareStatement(removeString)) {
            connectionHandler.conn.setAutoCommit(false);

            deleteList.setString(1, this.shoppingListID);
            deleteList.executeUpdate();

            connectionHandler.conn.commit();
            deleteList.close();
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
