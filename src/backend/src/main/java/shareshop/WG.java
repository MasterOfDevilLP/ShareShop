package shareshop;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
     * private function to update the DB after a change of any attribute of the wg
     * @param connectionHandler
     * @param wgID
     * @param wgName
     * @param creationDate
     * @throws SQLException
     */
    private void updateDB(DBConnectionHandler connectionHandler, String wgID, String wgName, Date creationDate) throws SQLException {
        String updateString = new String("UPDATE wg SET wgid = ?, wgname = ?, creationdate = ? WHERE wgid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteUser = connectionHandler.conn.prepareStatement(updateString)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteUser.setString(1, wgID);
            deleteUser.setString(2, wgName);
            deleteUser.setDate(3, creationDate);
            deleteUser.setString(4, this.wgID);
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
     * update wgID
     * @param connectionHandler
     * @param wgID
     * @throws SQLException
     */
    public void setWgID(DBConnectionHandler connectionHandler, String wgID) throws SQLException {
        this.updateDB(connectionHandler, wgID, this.wgName, this.creationDate);
        this.wgID = wgID;
    }

    /**
     * update wg name
     * @param connectionHandler
     * @param wgName
     * @throws SQLException
     */
    public void setWgName(DBConnectionHandler connectionHandler, String wgName) throws SQLException {
        this.updateDB(connectionHandler, this.wgID, wgName, this.creationDate);
        this.wgName = wgName;
    }

    /**
     * update creation date
     * @param connectionHandler
     * @param creationDate
     * @throws SQLException
     */
    public void setCreationDate(DBConnectionHandler connectionHandler, Date creationDate) throws SQLException {
        this.updateDB(connectionHandler, this.wgID, this.wgName, creationDate);
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

    public ShoppingList getList(DBConnectionHandler connectionHandler, String shoppingListID) {
        return new ShoppingList(); // TODO: implement getList after implementing the ShoppingList Class
    }

    // TODO: createList

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
