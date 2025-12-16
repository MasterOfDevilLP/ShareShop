package shareshop;

import java.time.LocalDateTime;
import java.util.UUID;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Time;
import java.sql.Timestamp;

public class Invite {
    private DBConnectionHandler connectionHandler;
    private UUID token;
    private UUID wgid;
    private UUID userid;                    // if the invite is for a specific user
    private Timestamp creationdatetime;
    private Timestamp expirydatetime;

    /**
     * Constructor of class Invite without using the DB
     * @param connectionHandler
     * @param token
     * @param wgid
     * @param userid
     * @param creationdatetime
     * @param expirydatetime
     */
    public Invite(DBConnectionHandler connectionHandler, UUID token, UUID wgid, UUID userid, Timestamp creationdatetime, Timestamp expirydatetime) {
        this.connectionHandler = connectionHandler;
        this.token = token;
        this.wgid = wgid;
        this.userid = userid;
        this.creationdatetime = creationdatetime;
        this.expirydatetime = expirydatetime;
    }

    /**
     * Constructor of class Invite from an existing invite on the DB
     * @param connectionHandler
     * @param token
     * @throws SQLException
     */
    public Invite(DBConnectionHandler connectionHandler, UUID token) throws SQLException {
        this.connectionHandler = connectionHandler;
        connectionHandler.makeSureItsOpen();

        String selectString = "SELECT * FROM invites WHERE token = ?";
        PreparedStatement selectStatement = connectionHandler.conn.prepareStatement(selectString);
        selectStatement.setObject(1, token);
        ResultSet rs = selectStatement.executeQuery();
        if (rs.next()) {
            this.token = (UUID)rs.getObject("token");
            this.wgid = (UUID)rs.getObject("wgid");
            this.userid = (UUID)rs.getObject("userid");
            this.creationdatetime = rs.getTimestamp("creationdatetime");
            this.expirydatetime = rs.getTimestamp("expirydatetime");
            selectStatement.close();
        } else {
            selectStatement.close();
            throw new SQLException("there is no invite with token: " + token);
        }
    }

    /**
     * Constructor of class Invite creating a new Object on the DB
     * @param connectionHandler
     * @param wgid
     * @param userid
     * @param creationdatetime
     * @param expirydatetime
     * @throws SQLException
     */
    public Invite(DBConnectionHandler connectionHandler, UUID wgid, UUID userid, Timestamp creationdatetime, Timestamp expirydatetime) throws SQLException {
        this.connectionHandler = connectionHandler;
        connectionHandler.makeSureItsOpen();

        String insertString = "INSERT INTO invites (token, wgid, userid, creationdatetime, expirydatetime) VALUES (?, ?, ?, ?, ?)";
        PreparedStatement insertStatement = connectionHandler.conn.prepareStatement(insertString);

        this.token = UUID.randomUUID();
        this.wgid = wgid;
        this.userid = userid;
        this.creationdatetime = creationdatetime;
        this.expirydatetime = expirydatetime;

        insertStatement.setObject(1, this.token);
        insertStatement.setObject(2, wgid);
        insertStatement.setObject(3, userid);
        insertStatement.setTimestamp(4, creationdatetime);
        insertStatement.setTimestamp(5, expirydatetime);
        insertStatement.execute();
        insertStatement.close();
    }

    /**
     * get the Token of the Invite
     * @return UUID
     */
    public UUID getToken() {return this.token;}

    /**
     * get the wgid of the Invite
     * @return UUID
     */
    public UUID getWgID() {return this.wgid;}

    /**
     * get the userid of the Invite
     * @return UUID
     */
    public UUID getUserID() {return this.userid;}

    /**
     * get the creationDateTime of the Invite
     * @return Timestamp
     */
    public Timestamp getCreationDateTime() {return this.creationdatetime;}

    /**
     * get the expiryDateTime of the Invite
     * @return Timestamp
     */
    public Timestamp getExpiryDateTime() {return this.expirydatetime;}

    /**
     * checks if the invite is still valid
     * @return boolean
     */
    public boolean checkValidity() {
        if (this.expirydatetime == null) {return true;}
        return Timestamp.valueOf(LocalDateTime.now()).compareTo(this.expirydatetime) < 0;
    }

    /**
     * checks if the User is allowed to use this invite and if the invite itself is valid
     * (if userid of the Invite is null it is always true)
     * @param user
     * @return boolean
     */
    public boolean checkIfValidForUser(User user) {
        if (this.userid == null) {return true && this.checkValidity();}
        return user.getUserID().equals(this.userid) && this.checkValidity();
    }

    /**
     * deletes the Invite on the DB
     * @throws SQLException
     */
    public void remove() throws SQLException {
        connectionHandler.makeSureItsOpen();

        String deleteString = "DELETE FROM invites WHERE token = ?";
        PreparedStatement deleteStatement = connectionHandler.conn.prepareStatement(deleteString);
        
        deleteStatement.setObject(1, this.token);
        deleteStatement.execute();
        deleteStatement.close();
    }

    @Override
    public String toString() {
        return new String("Invite with token: " + this.token + "\nfrom wg: " + this.wgid + "\nfor user: " + this.userid + "\ncreated at: " + this.creationdatetime + "\n valid until: " + this.expirydatetime);
    }
}
