package shareshop;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;

public class WG {
    private String wgID;
    private String wgName;
    private Date creationDate;
    
    /**
     * Constructor of Class WG
     * @param wgID
     * @param wgName
     * @param creationDate
     */
    public WG(String wgID, String wgName, Date creationDate) {
        this.wgID = wgID;
        this.wgName = wgName;
        this.creationDate = creationDate;
    }

    /**
     * Constructor of Class WG via wgID and DB query
     * @param connectionHandler
     * @param wgID
     * @throws SQLException
     */
    public WG(DBConnectionHandler connectionHandler, String wgID) throws SQLException {
        String selectString = new String ("SELECT * FROM wg WHERE wgid = ?");
        PreparedStatement select = connectionHandler.conn.prepareStatement(selectString);
        select.setString(1, wgID);
        ResultSet rs = select.executeQuery();
        if (rs.next()) {
            this.wgID = wgID;
            this.wgName = rs.getString("wgname");
            this.creationDate = rs.getDate("creationdate");
            select.close();
        } else {
            select.close();
            throw new SQLException("there is no WG with wgID: " + wgID);
        }
    }

    /**
     * private function to update the DB after a change of any attribute of the wg
     * @param connectionHandler
     * @param wgID
     * @param wgName
     * @param creationDate
     * @throws SQLException
     */
    private void updateDB(DBConnectionHandler connectionHandler, String wgName, Date creationDate) throws SQLException {
        String updateString = new String("UPDATE wg SET wgname = ?, creationdate = ? WHERE wgid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteUser = connectionHandler.conn.prepareStatement(updateString)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteUser.setString(1, wgName);
            deleteUser.setDate(2, creationDate);
            deleteUser.setString(3, this.wgID);
            deleteUser.executeUpdate();
            connectionHandler.conn.commit();
            deleteUser.close();
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            if (connectionHandler.conn != null) {
                System.err.println("Transaction failed, rolling back...");
                connectionHandler.conn.rollback();
            }
        }
    }

    /**
     * update wg name
     * @param connectionHandler
     * @param wgName
     * @throws SQLException
     */
    public void setWgName(DBConnectionHandler connectionHandler, String wgName) throws SQLException {
        this.updateDB(connectionHandler, wgName, this.creationDate);
        this.wgName = wgName;
    }

    /**
     * update creation date
     * @param connectionHandler
     * @param creationDate
     * @throws SQLException
     */
    public void setCreationDate(DBConnectionHandler connectionHandler, Date creationDate) throws SQLException {
        this.updateDB(connectionHandler, this.wgName, creationDate);
        this.creationDate = creationDate;
    }

    /**
     * get wgID
     * @return
     */
    public String getWgID() {return this.wgID;}

    /**
     * get wg name
     * @return
     */
    public String getWgName() {return this.wgName;}

    /**
     * get creation date
     * @return
     */
    public Date getCreationDate() {return this.creationDate;}

    /**
     * check if the user is part of the wg
     * @param user
     * @return
     */
    public boolean hasUser(User user) {
        if (user.getWgID() == this.wgID)    return true;
        else                                return false;
    }

    /**
     * adds a user to the wg
     * @param connectionHandler
     * @param user
     * @throws SQLException
     */
    public void addUser(DBConnectionHandler connectionHandler, User user) throws SQLException {
        user.setWgID(connectionHandler, this.wgID);
    }

    /**
     * removes a user from the wg
     * @param connectionHandler
     * @param user
     * @throws SQLException
     */
    public void removeUser(DBConnectionHandler connectionHandler, User user) throws SQLException {
        user.setWgID(connectionHandler, null);
    }

    /**
     * get the Shoppinglist as an Object corresponding to the ID
     * @param connectionHandler
     * @param shoppingListID
     * @return  Shoppinglist Object,
     *          or null if there is no shoppinglist with this ID.
     * @throws SQLException
     */
    public ShoppingList getList(DBConnectionHandler connectionHandler, String shoppingListID) throws SQLException {
        String selectString = new String("SELECT * FROM shoppinglists WHERE shoppinglistid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement selectStatement = connectionHandler.conn.prepareStatement(selectString);
        selectStatement.setString(1, shoppingListID);
        ResultSet rs = selectStatement.executeQuery();
        if (rs.next()) {
            ShoppingList newShoppingList = new ShoppingList(    rs.getString("shoppinglistid"), 
                                                                rs.getString("wgid"), 
                                                                rs.getInt("lastcachedchangeid"), 
                                                                rs.getDate("creationdate"), 
                                                                rs.getString("listname"), 
                                                                rs.getString("creatoruserid"));
            selectStatement.close();
            return newShoppingList;
        }
        selectStatement.close();
        return null;
    }

    /**
     * creates a new list on the database, adds the first change to the changelist ('CREATED') and returns the object of the new ShoppingList
     * @param connectionHandler
     * @param user
     * @param name
     * @return  ShoppingList Object,
     *          or null when something goes wrong.
     * @throws SQLException
     */
    public ShoppingList createList(DBConnectionHandler connectionHandler, User user, String name) throws SQLException {
        Date currentDate = Date.valueOf(LocalDate.now());
        String uuid = ShareShopUtility.genNewUUID(connectionHandler);
        String insertString = new String("INSERT INTO shoppinglists(shoppinglistid, wgid, lastcachedchangeid, creationdate, listname, creatoruserid) VALUES(?, ?, ?, ?, ?, ?)");
        String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, userid) VALUES(?, ?, ?, ?, ?)");
        connectionHandler.makeSureItsOpen();
        try (   PreparedStatement insertStatement = connectionHandler.conn.prepareStatement(insertString);
                PreparedStatement listChangeStatement = connectionHandler.conn.prepareStatement(listChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            insertStatement.setString(1, uuid);
            insertStatement.setString(2, this.wgID);
            insertStatement.setInt(3, 1);
            insertStatement.setDate(4, currentDate);
            insertStatement.setString(5, name);
            insertStatement.setString(6, user.getUserID());

            listChangeStatement.setString(1, uuid);
            listChangeStatement.setInt(2, 1);
            listChangeStatement.setString(3, "CREATED");
            listChangeStatement.setDate(4, currentDate);
            listChangeStatement.setString(5, user.getUserID());

            connectionHandler.conn.commit();
            insertStatement.close();
            listChangeStatement.close();
            return new ShoppingList(uuid, this.wgID, 1, currentDate, name, user.getUserID());
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            if (connectionHandler.conn != null) {
                System.err.println("Transaction failed, rolling back...");
                connectionHandler.conn.rollback();
            }
        }
        return null;
    }

    /**
     * get a list of ShoppingList Objects from the wg
     * @param connectionHandler
     * @return
     * @throws SQLException
     */
    public ArrayList<ShoppingList> lists(DBConnectionHandler connectionHandler) throws SQLException {
        String selectString = new String("SELECT shoppinglistid FROM shoppinglists WHERE wgid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement selectStatement = connectionHandler.conn.prepareStatement(selectString);
        selectStatement.setString(1, this.wgID);
        ResultSet rs = selectStatement.executeQuery();
        ArrayList<ShoppingList> lists = new ArrayList<ShoppingList>();
        while (rs.next()) {
            lists.add(this.getList(connectionHandler, rs.getString("shoppinglistid")));
        }
        selectStatement.close();

        return lists;
    }

    /**
     * removes the wg from the database
     * @param connectionHandler
     * @throws SQLException
     */
    public void remove(DBConnectionHandler connectionHandler) throws SQLException {
        String removeString = new String("DELETE FROM wg WHERE wgid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteWG = connectionHandler.conn.prepareStatement(removeString)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteWG.setString(1, this.wgID);
            deleteWG.executeUpdate();
            connectionHandler.conn.commit();
            deleteWG.close();
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
