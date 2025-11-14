package shareshop;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

import org.javatuples.Pair;

import shareshop.ListChange.ChangeEnum;

public class ShoppingList {
    private DBConnectionHandler connectionHandler;
    private UUID shoppingListID;
    private UUID wgID;
    private int lastCachedCahngeID;
    private Date creationDate;
    private String listName;
    private UUID creatorUserID;
    private ArrayList<ItemAllocation> itemAllocations;
    public enum Change {
        ADD,
        REMOVE,
        TICK
    }

    protected class ItemAllocation {
        private DBConnectionHandler connectionHandler;
        private Item item;
        private UUID shoppingListID;
        private Date creationDate;
        private int amount;

        /**
         * Constructor of Class ItemAllocation
         * @param connectionHandler
         * @param item
         * @param shoppingListID
         * @param creationDate
         * @param amount
         */
        public ItemAllocation(DBConnectionHandler connectionHandler, Item item, UUID shoppingListID, Date creationDate, int amount) {
            this.connectionHandler = connectionHandler;
            this.item = item;
            this.shoppingListID = shoppingListID;
            this.creationDate = creationDate;
            this.amount = amount;
        }

        /**
         * "generates" the next ID for a new change entry in the listchanges table
         * @return the next ID for a new change entry
         * @throws SQLException
         */
        private int newChangeID() throws SQLException {
            String lastChangesString = new String("SELECT MAX(listchangeid) FROM listchanges WHERE shoppinglistid = ?");
            connectionHandler.makeSureItsOpen();
            PreparedStatement lastChanges = connectionHandler.conn.prepareStatement(lastChangesString);
            lastChanges.setObject(1, this.shoppingListID);
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
         * @param amount
         * @throws SQLException
         */
        public void setAmountDB(int amount) throws SQLException {
            String updateString = new String("UPDATE itemallocation SET amount = ? WHERE itemid = ? AND shoppinglistid = ?");
            String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, itemid, amount) VALUES(?, ?, ?, ?, ?, ?)");
            connectionHandler.makeSureItsOpen();
            try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                    PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
                connectionHandler.conn.setAutoCommit(false);

                update.setInt(1, amount);
                update.setObject(2, this.item.getItemID());
                update.setObject(3, this.shoppingListID);

                listChange.setObject(1, this.shoppingListID);
                listChange.setInt(2, newChangeID());
                listChange.setString(3, "EDITED");
                listChange.setDate(4, Date.valueOf(LocalDate.now()));
                listChange.setObject(5, this.item.getItemID());
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
         * sets the amount of the item on the list
         * @param amount
         */
        public void setAmount(int amount) {
            this.amount = amount;
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
        public UUID getShoppingListID() {return this.shoppingListID;}

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
     * @param connectionHandler
     * @param shoppingListID
     * @param wgID
     * @param lastCachedCahngeID
     * @param creationDate
     * @param listName
     * @param creatorUserID
     */
    public ShoppingList(DBConnectionHandler connectionHandler, UUID shoppingListID, UUID wgID, int lastCachedCahngeID, Date creationDate, String listName, UUID creatorUserID) {
        this.connectionHandler = connectionHandler;
        this.shoppingListID = shoppingListID;
        this.wgID = wgID;
        this.lastCachedCahngeID = lastCachedCahngeID;
        this.creationDate = creationDate;
        this.listName = listName;
        this.creatorUserID = creatorUserID;
        this.itemAllocations = new ArrayList<ItemAllocation>();
    }

    /**
     * Constructor of Class ShoppingList via shoppingListID and DB query
     * @param connectionHandler
     * @param shoppingListID
     * @throws SQLException
     */
    public ShoppingList(DBConnectionHandler connectionHandler, UUID shoppingListID) throws SQLException {
        this.connectionHandler = connectionHandler;
        String selectString = new String ("SELECT * FROM shoppinglists WHERE shoppinglistid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement select = connectionHandler.conn.prepareStatement(selectString);
        select.setObject(1, shoppingListID);
        ResultSet rs = select.executeQuery();
        if (rs.next()) {
            this.shoppingListID = shoppingListID;
            this.wgID = (UUID)rs.getObject("wgid");
            this.lastCachedCahngeID = rs.getInt("lastcachedchangeid");
            this.creationDate = rs.getDate("creationdate");
            this.listName = rs.getString("listname");
            this.creatorUserID = (UUID)rs.getObject("creatoruserid");
            select.close();
        } else {
            select.close();
            throw new SQLException("there is no ShoppingList with shoppingListID: " + shoppingListID);
        }

        /* ItemAllocations */

        this.itemAllocations = new ArrayList<ItemAllocation>();
        selectString = new String ("SELECT * FROM itemallocation WHERE shoppinglistid = ?");
        select = connectionHandler.conn.prepareStatement(selectString);
        select.setObject(1, shoppingListID);
        rs = select.executeQuery();
        while (rs.next()) {
            this.itemAllocations.add(new ItemAllocation(connectionHandler, new Item(connectionHandler, (UUID)rs.getObject("itemid")), shoppingListID, rs.getDate("creationdate"), rs.getInt("amount")));
        }
        select.close();
    }

    /**
     * "generates" the next ID for a new change entry in the listchanges table
     * @return the next ID for a new change entry
     * @throws SQLException
     */
    private int newChangeID() throws SQLException {
        String lastChangesString = new String("SELECT MAX(listchangeid) FROM listchanges WHERE shoppinglistid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement lastChanges = connectionHandler.conn.prepareStatement(lastChangesString);
        lastChanges.setObject(1, this.shoppingListID);
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
     * @param listName
     * @throws SQLException
     */
    public void setListName(String listName) throws SQLException {
        String updateString = new String("UPDATE shoppinglists SET listname = ? WHERE shoppinglistid = ?");
        String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, listname) VALUES(?, ?, ?, ?, ?)");
        connectionHandler.makeSureItsOpen();
        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            update.setString(1, listName);
            update.setObject(2, this.shoppingListID);

            listChange.setObject(1, this.shoppingListID);
            listChange.setInt(2, newChangeID());
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
        items.trimToSize();
        return items;
    }

    public UUID getShoppingListId() {
    	return shoppingListID;
    }
    
    public String getName() {
    	return listName;
    }
    
    /**
     * get the change log of the shoppinglist with pagination as an ArrayList filled with objects of the class ListChanges
     * @param start
     *              first row is 1.
     *              If start is 0 or higher then the last row it will start at the first row.
     * @param end   first row is 1.
     *              If end is 0 or higher then last row it will go until the last row.
     * @return      ArrayList with ListChange objects if there are changes in the list.
     *              null if there are no changes
     * @throws SQLException
     * @throws IllegalArgumentException if start >= end
     */
    public ArrayList<ListChange> getChangeLog(int start, int end) throws SQLException, IllegalArgumentException {
        if (start >= end) {throw new IllegalArgumentException("end has to be bigger then start");}
        String selectString = new String("SELECT * FROM listchanges WHERE shoppinglistid = ? ORDER BY listchangeid ASC");
        connectionHandler.makeSureItsOpen();
        PreparedStatement selectStatement = connectionHandler.conn.prepareStatement(selectString, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
        selectStatement.setObject(1, this.shoppingListID);

        ResultSet rs = selectStatement.executeQuery();
        rs.last();
        int length = rs.getRow();
        int last = end != 0 && end <= length ? end : length;
        if (length == 0) {return null;}
        ArrayList<ListChange> listchanges = new ArrayList<ListChange>();
        rs.absolute(start != 0 && start <= length ? start : 1);
        do {
            listchanges.add(new ListChange( (UUID)rs.getObject("shoppinglistid"),
                                            rs.getInt("listchangeid"), 
                                            ChangeEnum.valueOf(rs.getString("change")), 
                                            rs.getDate("changedate"), (UUID)rs.getObject("itemid"),
                                            rs.getString("listname"), 
                                            rs.getInt("amount"),
                                            (UUID)rs.getObject("userid"),
                                            rs.getBigDecimal("price")));
        } while ((rs.getRow() < last) && rs.next());
        selectStatement.close();
        listchanges.trimToSize();
        return listchanges;
    }

    /**
     * add a change made to the list (that has something to do with the items on the list, for changing name use the setListName() function)
     * @param user
     * @param item
     * @param change
     *              ADD: add items to the list.
     *              REMOVE: remove items from the list.
     *              TICK: also remove items from the list after buying them.
     * @param args
     *              ADD:    first arg is amount from type Integer -> how much of the item is added to the list.
     *              REMOVE: first arg is amount from type Integer -> how much of the item is removed from the list.
     *              TICK:   first arg ist amount from type Integer -> how much of the item got bought (the amount that will be removed).
     *                      second arg is the price from type BigDecimal -> how much did it cost to buy the amount of items.
     * @throws SQLException
     */
    public void addChange(User user, Item item, Change change, Object... args) throws SQLException, IllegalArgumentException {
        switch (change) {
            case Change.ADD: {
                if (!(args[0] instanceof Integer)) {throw new IllegalArgumentException("argument must be from type Integer");}
                int amount = (Integer)args[0];
                for (ItemAllocation itemAllocation : itemAllocations) { // if the item is already on the list, the amount gets added onto the current amount
                    if (itemAllocation.getItem().equals(item)) {
                        String updateString = new String("UPDATE itemallocation SET amount = ? WHERE itemid = ? AND shoppinglistid = ?"); // will get put into updateCache() later
                        String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, itemid, userid, amount) VALUES(?, ?, ?, ?, ?, ?, ?)");
                        connectionHandler.makeSureItsOpen();
                        try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                                PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
                            connectionHandler.conn.setAutoCommit(false);
                                
                            update.setInt(1, amount  + itemAllocation.getAmount());
                            update.setObject(2, item.getItemID());
                            update.setObject(3, this.shoppingListID);
                                
                            listChange.setObject(1, this.shoppingListID);
                            listChange.setInt(2, newChangeID());
                            listChange.setString(3, "ADDED");
                            listChange.setDate(4, Date.valueOf(LocalDate.now()));
                            listChange.setObject(5, item.getItemID());
                            listChange.setObject(6, user.getUserID());
                            listChange.setInt(7, amount); // the amount that gets added onto the current amount
                                
                            update.execute();
                            listChange.execute();
                            connectionHandler.conn.commit();
                            update.close();
                            listChange.close();
                            itemAllocation.setAmount(amount + itemAllocation.getAmount());
                        } catch (SQLException e) {
                            System.err.println(e.getMessage());
                            if (connectionHandler.conn != null) {
                                System.err.println("Transaction failed, rolling back...");
                                connectionHandler.conn.rollback();
                            }
                        }
                        return;
                    }
                }

                // if the item is not on the list, it gets added onto the list with the amount
                String insertString = new String("INSERT INTO itemallocation(itemid, shoppinglistid, creationdate, amount) VALUES(?, ?, ?, ?)");
                String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, itemid, userid, amount) VALUES(?, ?, ?, ?, ?, ?, ?)");
                connectionHandler.makeSureItsOpen();
                try (   PreparedStatement insert = connectionHandler.conn.prepareStatement(insertString);
                        PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
                    connectionHandler.conn.setAutoCommit(false);
                        
                    insert.setObject(1, item.getItemID());
                    insert.setObject(2, this.shoppingListID);
                    insert.setDate(3, Date.valueOf(LocalDate.now()));
                    insert.setInt(4, amount);
                        
                    listChange.setObject(1, this.shoppingListID);
                    listChange.setInt(2, newChangeID());
                    listChange.setString(3, "ADDED");
                    listChange.setDate(4, Date.valueOf(LocalDate.now()));
                    listChange.setObject(5, item.getItemID());
                    listChange.setObject(6, user.getUserID());
                    listChange.setInt(7, amount);
                        
                    insert.execute();
                    listChange.execute();
                    connectionHandler.conn.commit();
                    insert.close();
                    listChange.close();
                    itemAllocations.add(new ItemAllocation(connectionHandler, item, this.shoppingListID, Date.valueOf(LocalDate.now()), amount));
                } catch (SQLException e) {
                    System.err.println(e.getMessage());
                    if (connectionHandler.conn != null) {
                        System.err.println("Transaction failed, rolling back...");
                        connectionHandler.conn.rollback();
                    }
                }
            } break;
            case Change.REMOVE: {
                if (!(args[0] instanceof Integer)) {throw new IllegalArgumentException("argument must be from type Integer");}
                int amount = (Integer)args[0];
                for (ItemAllocation itemAllocation : itemAllocations) {
                    if (itemAllocation.getItem().equals(item)) {
                        if (itemAllocation.getAmount() - amount <= 0) { // the item gets completely removed from the shoppinglist
                            String deleteString = new String("DELETE FROM itemallocation WHERE itemid = ? AND shoppinglistid = ?");
                            String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, itemid, userid, amount) VALUES(?, ?, ?, ?, ?, ?, ?)");
                            connectionHandler.makeSureItsOpen();
                            try (   PreparedStatement deleteStatement = connectionHandler.conn.prepareStatement(deleteString);
                                    PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
                                connectionHandler.conn.setAutoCommit(false);
                                    
                                deleteStatement.setObject(1, item.getItemID());
                                deleteStatement.setObject(2, this.shoppingListID);
                                    
                                listChange.setObject(1, this.shoppingListID);
                                listChange.setInt(2, newChangeID());
                                listChange.setString(3, "REMOVED");
                                listChange.setDate(4, Date.valueOf(LocalDate.now()));
                                listChange.setObject(5, item.getItemID());
                                listChange.setObject(6, user.getUserID());
                                listChange.setInt(7, amount);
                                    
                                deleteStatement.execute();
                                listChange.execute();
                                connectionHandler.conn.commit();
                                deleteStatement.close();
                                listChange.close();
                                itemAllocations.remove(itemAllocation);
                            } catch (SQLException e) {
                                System.err.println(e.getMessage());
                                if (connectionHandler.conn != null) {
                                    System.err.println("Transaction failed, rolling back...");
                                    connectionHandler.conn.rollback();
                                }
                            }
                            return;
                        } else {
                            String updateString = new String("UPDATE itemallocation SET amount = ? WHERE itemid = ? AND shoppinglistid = ?"); // will get put into updateCache() later
                            String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, itemid, userid, amount) VALUES(?, ?, ?, ?, ?, ?, ?)");
                            try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                                    PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
                                connectionHandler.conn.setAutoCommit(false);
                                    
                                update.setInt(1, itemAllocation.getAmount() - amount);
                                update.setObject(2, item.getItemID());
                                update.setObject(3, this.shoppingListID);
                                    
                                listChange.setObject(1, this.shoppingListID);
                                listChange.setInt(2, newChangeID());
                                listChange.setString(3, "REMOVED");
                                listChange.setDate(4, Date.valueOf(LocalDate.now()));
                                listChange.setObject(5, item.getItemID());
                                listChange.setObject(6, user.getUserID());
                                listChange.setInt(7, amount); // the amount that gets removed from the current amount
                                
                                update.execute();
                                listChange.execute();
                                connectionHandler.conn.commit();
                                update.close();
                                listChange.close();
                                itemAllocation.setAmount(itemAllocation.getAmount() - amount);
                            } catch (SQLException e) {
                                System.err.println(e.getMessage());
                                if (connectionHandler.conn != null) {
                                    System.err.println("Transaction failed, rolling back...");
                                    connectionHandler.conn.rollback();
                                }
                            }
                        }
                    }
                }
            } break;
            case Change.TICK: {
                if (!(args[0] instanceof Integer)) {throw new IllegalArgumentException("argument must be from type Integer");}
                if (!(args[1] instanceof BigDecimal)) {throw new IllegalArgumentException("argument must be from type BigDecimal");}
                int amount = (Integer)args[0];
                BigDecimal price = (BigDecimal)args[1];
                for (ItemAllocation itemAllocation : itemAllocations) {
                    if (itemAllocation.getItem().equals(item)) {
                        if (itemAllocation.getAmount() - amount <= 0) { // the item gets completely removed from the shoppinglist
                            String deleteString = new String("DELETE FROM itemallocation WHERE itemid = ? AND shoppinglistid = ?");
                            String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, itemid, userid, amount, price) VALUES(?, ?, ?, ?, ?, ?, ?, ?)");
                            connectionHandler.makeSureItsOpen();
                            try (   PreparedStatement deleteStatement = connectionHandler.conn.prepareStatement(deleteString);
                                    PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
                                connectionHandler.conn.setAutoCommit(false);
                                    
                                deleteStatement.setObject(1, item.getItemID());
                                deleteStatement.setObject(2, this.shoppingListID);
                                    
                                listChange.setObject(1, this.shoppingListID);
                                listChange.setInt(2, newChangeID());
                                listChange.setString(3, "REMOVED");
                                listChange.setDate(4, Date.valueOf(LocalDate.now()));
                                listChange.setObject(5, item.getItemID());
                                listChange.setObject(6, user.getUserID());
                                listChange.setInt(7, amount);
                                listChange.setBigDecimal(8, price);
                                
                                deleteStatement.execute();
                                listChange.execute();
                                connectionHandler.conn.commit();
                                deleteStatement.close();
                                listChange.close();
                                itemAllocations.remove(itemAllocation);
                            } catch (SQLException e) {
                                System.err.println(e.getMessage());
                                if (connectionHandler.conn != null) {
                                    System.err.println("Transaction failed, rolling back...");
                                    connectionHandler.conn.rollback();
                                }
                            }
                            return;
                        } else {
                            String updateString = new String("UPDATE itemallocation SET amount = ? WHERE itemid = ? AND shoppinglistid = ?"); // will get put into updateCache() later
                            String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, itemid, userid, amount, price) VALUES(?, ?, ?, ?, ?, ?, ?, ?)");
                            connectionHandler.makeSureItsOpen();
                            try (   PreparedStatement update = connectionHandler.conn.prepareStatement(updateString);
                                    PreparedStatement listChange = connectionHandler.conn.prepareStatement(listChangeString)) {
                                connectionHandler.conn.setAutoCommit(false);
                                    
                                update.setInt(1, itemAllocation.getAmount() - amount);
                                update.setObject(2, item.getItemID());
                                update.setObject(3, this.shoppingListID);
                                    
                                listChange.setObject(1, this.shoppingListID);
                                listChange.setInt(2, newChangeID());
                                listChange.setString(3, "REMOVED");
                                listChange.setDate(4, Date.valueOf(LocalDate.now()));
                                listChange.setObject(5, item.getItemID());
                                listChange.setObject(6, user.getUserID());
                                listChange.setInt(7, amount); // the amount that gets removed from the current amount
                                listChange.setBigDecimal(8, price);
                                   
                                update.execute();
                                listChange.execute();
                                connectionHandler.conn.commit();
                                update.close();
                                listChange.close();
                                itemAllocation.setAmount(itemAllocation.getAmount() - amount);
                            } catch (SQLException e) {
                                System.err.println(e.getMessage());
                                if (connectionHandler.conn != null) {
                                    System.err.println("Transaction failed, rolling back...");
                                    connectionHandler.conn.rollback();
                                }
                            }
                        }
                    }
                }
            } break;
            default: {
                System.err.println("change value " + change + " does not correspond to a valid change");
            } break;
        }
    }

    /**
     * removes the Shoppinglist from the database
     * @throws SQLException
     */
    public void remove() throws SQLException {
        String removeString = new String("DELETE FROM shoppinglists WHERE shoppinglistid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteList = connectionHandler.conn.prepareStatement(removeString)) {
            connectionHandler.conn.setAutoCommit(false);

            deleteList.setObject(1, this.shoppingListID);
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
