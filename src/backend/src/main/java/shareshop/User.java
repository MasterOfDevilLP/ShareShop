package shareshop;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Class, that represents a user
 */
public class User {
    private String userID;
    private String wgID;
    private String firstName;
    private String lastName;
    private String email;
    private String pwd;

    /**
     * Constructor of Class User with wgID
     * @param userID
     * @param firstName can be null
     * @param lastName  can be null
     * @param email
     * @param pwd
     * @param wgID
     */
    public User(String userID, String firstName, String lastName, String email, String pwd, String wgID) {
        this.userID = userID;
        this.wgID = wgID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.pwd = pwd;
    }

    /**
     * Constructor of Class User without wgID
     * @param userID
     * @param firstName can be null
     * @param lastName  can be null
     * @param email
     * @param pwd
     */
    public User(String userID, String firstName, String lastName, String email, String pwd) {
        this.userID = userID;
        this.wgID = null;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.pwd = pwd;
    }

    /**
     * Construcot of Class User via userID and DB query
     * @param connectionHandler
     * @param userID
     * @throws SQLException
     */
    public User(DBConnectionHandler connectionHandler, String userID) throws SQLException {
        String selectString = new String ("SELECT * FROM users WHERE userid = ?");
        PreparedStatement select = connectionHandler.conn.prepareStatement(selectString);
        select.setString(1, userID);
        ResultSet rs = select.executeQuery();
        if (rs.next()) {
            this.userID = userID;
            this.wgID = rs.getString("wgid");
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
     * @param userID
     * @param wgID
     * @param firstName
     * @param lastName
     * @param email
     * @param pwd
     * @throws SQLException
     */
    private void updateDB(DBConnectionHandler connectionHandler, String wgID, String firstName, String lastName, String email, String pwd) throws SQLException {
        String updateString = new String("UPDATE users SET wgid = ?, firstname = ?, lastname = ?, email = ?, pwd = ? WHERE userid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteUser = connectionHandler.conn.prepareStatement(updateString)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteUser.setString(1, wgID);
            deleteUser.setString(2, firstName);
            deleteUser.setString(3, lastName);
            deleteUser.setString(4, email);
            deleteUser.setString(5, pwd);
            deleteUser.setString(6, this.userID);
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

    /**
     * updates wgID
     * @param wgID
     * @throws SQLException
     */
    public void setWgID(DBConnectionHandler connectionHandler, String wgID) throws SQLException {
        this.updateDB(connectionHandler, wgID, this.firstName, this.lastName, this.email, this.pwd);
        this.wgID = wgID;
    }

    /**
     * updates first name
     * @param firstName
     * @throws SQLException
     */
    public void setFirstName(DBConnectionHandler connectionHandler, String firstName) throws SQLException {
        this.updateDB(connectionHandler, this.wgID, firstName, this.lastName, this.email, this.pwd);
        this.firstName = firstName;
    }

    /**
     * updates last name
     * @param lastName
     * @throws SQLException
     */
    public void setLastName(DBConnectionHandler connectionHandler, String lastName) throws SQLException {
        this.updateDB(connectionHandler, this.wgID, this.firstName, lastName, this.email, this.pwd);
        this.lastName = lastName;
    }

    /**
     * updates email
     * @param email
     * @throws SQLException
     */
    public void setEmail(DBConnectionHandler connectionHandler, String email) throws SQLException {
        this.updateDB(connectionHandler, this.wgID, this.firstName, this.lastName, email, this.pwd);
        this.email = email;
    }

    /**
     * updates password
     * @param password
     * @throws SQLException
     */
    public void setPassword(DBConnectionHandler connectionHandler, String password) throws SQLException {
        this.updateDB(connectionHandler, this.wgID, this.firstName, this.lastName, this.email, pwd);
        this.pwd = password;
    }

    /**
     * get userID
     * @return
     */
    public String getUserID() {return this.userID;}

    /**
     * get wgID
     * @return
     */
    public String getWgID() {return this.wgID;}

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
     * removes the user from the database
     * @param connectionHandler
     * @throws SQLException
     */
    public void remove(DBConnectionHandler connectionHandler) throws SQLException {
        String removeUser = new String("DELETE FROM users WHERE userid = ?");
        connectionHandler.makeSureItsOpen();
        try (PreparedStatement deleteUser = connectionHandler.conn.prepareStatement(removeUser)) {
            connectionHandler.conn.setAutoCommit(false);
            deleteUser.setString(1, this.userID);
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
