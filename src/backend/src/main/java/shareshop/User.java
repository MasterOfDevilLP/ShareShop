package shareshop;

import java.lang.reflect.Array;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.UUID;

/**
 * Class, that represents a user
 */
public class User {
    private DBConnectionHandler connectionHandler;
    private UUID userID;
    //private UUID wgID;
    private String firstName;
    private String lastName;
    private String email;
    private String pwd;

    /**
     * Constructor of Class User
     * @param userID
     * @param firstName can be null
     * @param lastName  can be null
     * @param email
     * @param pwd
     */
    public User(DBConnectionHandler connectionHandler, UUID userID, String firstName, String lastName, String email, String pwd) {
        this.connectionHandler = connectionHandler;
        this.userID = userID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.pwd = pwd;
    }
    
    // Constructors using the DB
    
    // Creates a new user
    public User(DBConnectionHandler conn, String email, String pwdhash) throws SQLException {
        this.connectionHandler = conn;
    	conn.makeSureItsOpen();
    	String statementStr = "INSERT INTO users (userid, email, pwd) VALUES (?, ?, ?)";
        conn.makeSureItsOpen();
    	PreparedStatement statement = conn.conn.prepareStatement(statementStr);
    	conn.conn.setAutoCommit(true);
    	UUID uuid = UUID.randomUUID();
    	statement.setObject(1, uuid);
    	statement.setString(2, email);
    	statement.setString(3, pwdhash);
    	statement.execute();
    	statement.close();
    	this.userID = uuid;
    	this.email = email;
    	this.pwd = pwdhash;
    }

    /**
     * Construcot of Class User via userID and DB query
     * @param connectionHandler
     * @param userID
     * @throws SQLException
     */
    public User(DBConnectionHandler connectionHandler, UUID userID) throws SQLException {
        this.connectionHandler = connectionHandler;
        String selectString = new String ("SELECT * FROM users WHERE userid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement select = connectionHandler.conn.prepareStatement(selectString);
        select.setObject(1, userID);
        ResultSet rs = select.executeQuery();
        if (rs.next()) {
            this.userID = userID;
            //this.wgID = (UUID)rs.getObject("wgid");
            this.firstName = rs.getString("firstname");
            this.lastName = rs.getString("lastname");
            this.email = rs.getString("email");
            this.pwd = rs.getString("pwd");
            select.close();
        } else {
            select.close();
            throw new SQLException("there is no user with userID: " + userID);
        }
    }

    /**
     * private function to update the DB after a change of any attribute of the user
     * @param connectionHandler
     * @param firstName
     * @param lastName
     * @param email
     * @param pwd
     * @throws SQLException
     */
    private void updateDB(DBConnectionHandler connectionHandler, String firstName, String lastName, String email, String pwd) throws SQLException {
        this.connectionHandler = connectionHandler;
        String updateString = new String("UPDATE users SET firstname = ?, lastname = ?, email = ?, pwd = ? WHERE userid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteUser = connectionHandler.conn.prepareStatement(updateString)) {
            connectionHandler.conn.setAutoCommit(false);
            //deleteUser.setObject(1, wgID);
            deleteUser.setString(1, firstName);
            deleteUser.setString(2, lastName);
            deleteUser.setString(3, email);
            deleteUser.setString(4, pwd);
            deleteUser.setObject(5, this.userID);
            deleteUser.executeUpdate();
            connectionHandler.conn.commit();
            deleteUser.close();
        } catch (SQLException e)
        {
            System.err.println(e.getMessage());
            if (connectionHandler.conn != null) {
                System.err.println("Transaction failed, rolling back...");
                connectionHandler.conn.rollback();
            }
        }
    }

    ///**
    // * updates wgID
    // * @param wgID
    // * @throws SQLException
    // */
    //public void setWgID(DBConnectionHandler connectionHandler, UUID wgID) throws SQLException {
    //    this.updateDB(connectionHandler, wgID, this.firstName, this.lastName, this.email, this.pwd);
    //    this.wgID = wgID;
    //}

    /**
     * updates first name
     * @param firstName
     * @throws SQLException
     */
    public void setFirstName(DBConnectionHandler connectionHandler, String firstName) throws SQLException {
        this.updateDB(connectionHandler, firstName, this.lastName, this.email, this.pwd);
        this.firstName = firstName;
    }

    /**
     * updates last name
     * @param lastName
     * @throws SQLException
     */
    public void setLastName(DBConnectionHandler connectionHandler, String lastName) throws SQLException {
        this.updateDB(connectionHandler, this.firstName, lastName, this.email, this.pwd);
        this.lastName = lastName;
    }

    /**
     * updates email
     * @param email
     * @throws SQLException
     */
    public void setEmail(DBConnectionHandler connectionHandler, String email) throws SQLException {
        this.updateDB(connectionHandler, this.firstName, this.lastName, email, this.pwd);
        this.email = email;
    }

    /**
     * updates password
     * @param password
     * @throws SQLException
     */
    public void setPassword(DBConnectionHandler connectionHandler, String password) throws SQLException {
        this.updateDB(connectionHandler, this.firstName, this.lastName, this.email, pwd);
        this.pwd = password;
    }

    /**
     * get userID
     * @return
     */
    public UUID getUserID() {return this.userID;}

    /**
     * get first name
     * @return
     */
    public String getFirstName() {return this.firstName;}

    /**
     * get last name
     * @return
     */
    public String getLastName() {return this.lastName;}

    /**
     * get email
     * @return
     */
    public String getEmail() {return this.email;}

    /**
     * get password
     * @return
     */
    public String getPassword() {return this.pwd;}

    /**
     * returns an ArrayList containing the UUID's of the WG's the user is part of
     * @param connectionHandler
     * @return
     * @throws SQLException
     */
    public ArrayList<UUID> getWgIDList() throws SQLException {
        ArrayList<UUID> wgidlist = new ArrayList<UUID>();
        String selectString = new String ("SELECT wgid FROM userallocation WHERE userid = ?");
        connectionHandler.makeSureItsOpen();
        PreparedStatement select = connectionHandler.conn.prepareStatement(selectString);
        select.setObject(1, userID);
        ResultSet rs = select.executeQuery();
        while (rs.next()) {
            wgidlist.add((UUID)rs.getObject("wgid"));
        }
        return wgidlist;
    }

    /**
     * checks if the User is in the WG with given wgid
     * @param wgid
     * @return
     * @throws SQLException
     */
    public boolean isUserInWG(UUID wgid) throws SQLException {
        ArrayList<UUID> wgidlist = getWgIDList();
        return wgidlist.contains(wgid);
    }

    /**
     * removes the user from the database
     * @param connectionHandler
     * @throws SQLException
     */
    public void remove(DBConnectionHandler connectionHandler) throws SQLException {
        String removeUser = new String("DELETE FROM users WHERE userid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteUser = connectionHandler.conn.prepareStatement(removeUser)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteUser.setObject(1, this.userID);
            deleteUser.executeUpdate();
            connectionHandler.conn.commit();
            deleteUser.close();
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
