package shareshop;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

public class WG {
    private DBConnectionHandler connectionHandler;
    private UUID wgID;
    private String wgName;
    private Date creationDate;
    
    /**
     * Constructor of Class WG
     * @param connectionHandler
     * @param wgID
     * @param wgName
     * @param creationDate
     */
    public WG(DBConnectionHandler connectionHandler, UUID wgID, String wgName, Date creationDate) {
        this.connectionHandler = connectionHandler;
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
    public WG(DBConnectionHandler connectionHandler, UUID wgID) throws SQLException {
        this.connectionHandler = connectionHandler;
        String selectString = new String ("SELECT * FROM wg WHERE wgid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement select = connectionHandler.conn.prepareStatement(selectString);
        select.setObject(1, wgID);
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
     * Constructor that creates a new WG
     * @param connectionHandler
     * @param name
     * @throws SQLException
     */
    public WG(DBConnectionHandler connectionHandler, String name) throws SQLException {
        this.connectionHandler = connectionHandler;
    	String statementStr = "INSERT INTO wg (wgid, wgname, creationdate) VALUES (?, ?, ?)";
        connectionHandler.makeSureItsOpen();
    	PreparedStatement statement = connectionHandler.conn.prepareStatement(statementStr);
    	UUID wid = UUID.randomUUID();
    	try {
    		Date creationDate = Date.valueOf(LocalDate.now());
    		connectionHandler.conn.setAutoCommit(false);
    		statement.setObject(1, wid);
    		statement.setString(2, name);
    		statement.setDate(3, creationDate);
    		statement.execute();
    		connectionHandler.conn.commit();
    		statement.close();
    		this.wgID = wid;
    		this.wgName = name;
    		this.creationDate = creationDate;
    	} catch(SQLException e) {
    		connectionHandler.conn.rollback();
    		throw e;
    	}
    	
    }

    /**
     * private function to update the DB after a change of any attribute of the wg
     * @param wgID
     * @param wgName
     * @param creationDate
     * @throws SQLException
     */
    private void updateDB(String wgName, Date creationDate) throws SQLException {
        String updateString = new String("UPDATE wg SET wgname = ?, creationdate = ? WHERE wgid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteUser = connectionHandler.conn.prepareStatement(updateString)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteUser.setString(1, wgName);
            deleteUser.setDate(2, creationDate);
            deleteUser.setObject(3, this.wgID);
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
     * @param wgName
     * @throws SQLException
     */
    public void setWgName(String wgName) throws SQLException {
        this.updateDB(wgName, this.creationDate);
        this.wgName = wgName;
    }

    /**
     * update creation date
     * @param creationDate
     * @throws SQLException
     */
    public void setCreationDate(Date creationDate) throws SQLException {
        this.updateDB(this.wgName, creationDate);
        this.creationDate = creationDate;
    }

    /**
     * get wgID
     * @return
     */
    public UUID getWgID() {return this.wgID;}

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
    public boolean hasUser(User user) throws SQLException {
        ArrayList<UUID> wglist = user.getWgIDList();
        if (wglist.contains(this.wgID))     return true;
        else                                return false;
    }

    /**
     * adds a user to the wg
     * @param user
     * @throws SQLException
     */
    public void addUser(User user) throws SQLException {
        String statementStr = new String("INSERT INTO userallocation (userid, wgid, joindate) VALUES (?, ?, ?)");
        connectionHandler.makeSureItsOpen();
        PreparedStatement statement = connectionHandler.conn.prepareStatement(statementStr);
        connectionHandler.conn.setAutoCommit(true);
        Date joinDate = Date.valueOf(LocalDate.now());
        statement.setObject(1, user.getUserID());
        statement.setObject(2, this.wgID);
        statement.setDate(3, joinDate);
        statement.execute();
        statement.close();
        //user.setWgID(connectionHandler, this.wgID);
    }

    /**
     * removes a user from the wg
     * @param user
     * @throws SQLException
     */
    public void removeUser(User user) throws SQLException {
        String statementStr = new String("DELETE FROM userallocation WHERE userid = ? AND wgid = ?");
        connectionHandler.makeSureItsOpen();
        connectionHandler.conn.setAutoCommit(false);
        PreparedStatement deleteStatement = connectionHandler.conn.prepareStatement(statementStr);
        connectionHandler.conn.setAutoCommit(true);
        deleteStatement.setObject(1, user.getUserID());
        deleteStatement.setObject(2, this.wgID);
        deleteStatement.execute();
        deleteStatement.close();
        //user.setWgID(connectionHandler, null);
    }

    /**
     * get the Shoppinglist as an Object corresponding to the ID
     * @param shoppingListID
     * @return  Shoppinglist Object,
     *          or null if there is no shoppinglist with this ID.
     */
    public ShoppingList getList(UUID shoppingListID){
    	try {
    		return new ShoppingList(connectionHandler, shoppingListID);
    	} catch(SQLException e) {
    		return null;
    	}
        /*String selectString = new String("SELECT * FROM shoppinglists WHERE shoppinglistid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement selectStatement = connectionHandler.conn.prepareStatement(selectString);
        selectStatement.setObject(1, shoppingListID);
        ResultSet rs = selectStatement.executeQuery();
        if (rs.next()) {
            ShoppingList newShoppingList = new ShoppingList(    (UUID)rs.getObject("shoppinglistid"), 
                                                                (UUID)rs.getObject("wgid"), 
                                                                rs.getInt("lastcachedchangeid"), 
                                                                rs.getDate("creationdate"), 
                                                                rs.getString("listname"), 
                                                                (UUID)rs.getObject("creatoruserid"));
            selectStatement.close();
            return newShoppingList;
        }
        selectStatement.close();
        return null;*/
    }

    /**
     * creates a new list on the database, adds the first change to the changelist ('CREATED') and returns the object of the new ShoppingList
     * @param user
     * @param name
     * @return  ShoppingList Object,
     *          or null when something goes wrong.
     * @throws SQLException
     */
    public ShoppingList createList(User user, String name) throws SQLException {
        Date currentDate = Date.valueOf(LocalDate.now());
        UUID uuid = UUID.randomUUID();//ShareShopUtility.genNewUUID(connectionHandler);
        String insertString = new String("INSERT INTO shoppinglists(shoppinglistid, wgid, lastcachedchangeid, creationdate, listname, creatoruserid) VALUES(?, ?, ?, ?, ?, ?)");
        String listChangeString = new String("INSERT INTO listchanges(shoppinglistid, listchangeid, change, changedate, userid) VALUES(?, ?, ?, ?, ?)");
        connectionHandler.makeSureItsOpen();
        try (   PreparedStatement insertStatement = connectionHandler.conn.prepareStatement(insertString);
                PreparedStatement listChangeStatement = connectionHandler.conn.prepareStatement(listChangeString)) {
            connectionHandler.conn.setAutoCommit(false);

            insertStatement.setObject(1, uuid);
            insertStatement.setObject(2, this.wgID);
            insertStatement.setInt(3, 1);
            insertStatement.setDate(4, currentDate);
            insertStatement.setString(5, name);
            insertStatement.setObject(6, user.getUserID());

            listChangeStatement.setObject(1, uuid);
            listChangeStatement.setInt(2, 1);
            listChangeStatement.setString(3, "CREATED");
            listChangeStatement.setDate(4, currentDate);
            listChangeStatement.setObject(5, user.getUserID());

            insertStatement.execute();
            listChangeStatement.execute();	// TODO: fix enum stuff
            connectionHandler.conn.commit();
            insertStatement.close();
            listChangeStatement.close();
            return new ShoppingList(connectionHandler, uuid, this.wgID, 1, currentDate, name, user.getUserID());
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
     * @return
     * @throws SQLException
     */
    public ArrayList<ShoppingList> lists(DBConnectionHandler connectionHandler) throws SQLException {
        String selectString = new String("SELECT shoppinglistid FROM shoppinglists WHERE wgid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement selectStatement = connectionHandler.conn.prepareStatement(selectString);
        selectStatement.setObject(1, this.wgID);
        ResultSet rs = selectStatement.executeQuery();
        ArrayList<ShoppingList> lists = new ArrayList<ShoppingList>();
        while (rs.next()) {
            lists.add(this.getList((UUID)rs.getObject("shoppinglistid")));
        }
        selectStatement.close();

        return lists;
    }

    /**
     * creates an Invite. Set user to null to make it valid for everyone. Sert expireDate to -1 to make it infinite
     * @param user
     * @param expireTime (in seconds)
     * @return Invite
     * @throws SQLException
     */
    public Invite createInvite(User user, long expireTime) throws SQLException {
        Timestamp currrentTime = Timestamp.valueOf(LocalDateTime.now());
        Timestamp expiringTime = expireTime != -1 ? ShareShopUtility.createTimestampInAmountOfTime(currrentTime, expireTime * 1000) : null;
        return new Invite(connectionHandler, this.wgID, user != null ? user.getUserID() : null, currrentTime, expiringTime);
    }

    /**
     * returns a list of all invites of this WG
     * @return ArrayList<Invite>
     * @throws SQLException
     */
    public ArrayList<Invite> getInvites() throws SQLException {
        connectionHandler.makeSureItsOpen();
        ArrayList<Invite> invites = new ArrayList<Invite>();
        String selectString = "SELECT token FROM invites WHERE wgid = ?";
        PreparedStatement selectStatement = connectionHandler.conn.prepareStatement(selectString);
        selectStatement.setObject(1, this.wgID);
        ResultSet rs = selectStatement.executeQuery();
        while (rs.next()) {
            invites.add(new Invite(connectionHandler, (UUID)rs.getObject("token")));
        }

        invites.trimToSize();
        return invites;
    }

    /**
     * tries to add the user to the wg via the invite. Returns true if invite was valid, returns false if invite was not valid and doesn't add User to wg
     * @param invite
     * @param user
     * @return boolean
     * @throws SQLException
     */
    public boolean joinViaInvite(Invite invite, User user) throws SQLException {
        if (user.isUserInWG(this.wgID)) {
            System.out.println("user is already in this wg");
            return false;
        }

        boolean canJoin = invite.checkIfValidForUser(user); // only need to check this, since it also checks the validity of the invite itself
        if (canJoin) {
            this.addUser(user);
            if (invite.getUserID() != null) {invite.remove();}  // deletes the invite on the DB when it was a specific invite for this user
            return canJoin;
        } else {
            System.out.println("Invite was invalid either to having expired or not being for this user");
            return canJoin;
        }
    }

    /**
     * removes the wg from the database
     * @throws SQLException
     */
    public void remove() throws SQLException {
        String removeString = new String("DELETE FROM wg WHERE wgid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteWG = connectionHandler.conn.prepareStatement(removeString)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteWG.setObject(1, this.wgID);
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
