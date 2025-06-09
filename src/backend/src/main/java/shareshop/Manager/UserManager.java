package shareshop.Manager;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HexFormat;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import shareshop.DBConnectionHandler;
import shareshop.User;

public class UserManager {
	
	private DBConnectionHandler conn;
	Logger logger;
	
	public UserManager(DBConnectionHandler conn) {
		this.conn = conn;
		logger = LoggerFactory.getLogger(getClass());
	}
	
	public User create(String email, String pwd) {
		logger.info("Creating a new user");
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			HexFormat form = HexFormat.of();
			String pwdhash = form.formatHex(digest.digest(pwd.getBytes()));
			return new User(conn, email, pwdhash);
		} catch(SQLException e) {
			logger.error("Failed to create new User: {}", e.getMessage());
			return null;
		} catch (NoSuchAlgorithmException e) {
			logger.error("Failed to create new User: {}", e.getMessage());
			return null;
		}
	}
	
	// for better authentication, this could probably be done with things jetty provides,
	// but this is good enough for now
	public User login(String email, String pwd) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			HexFormat form = HexFormat.of();
			String pwdhash = form.formatHex(digest.digest(pwd.getBytes()));
			
			conn.makeSureItsOpen();
			String statementStr = "SELECT userid, email, pwd FROM users WHERE email = ?";
	    	PreparedStatement statement = conn.conn.prepareStatement(statementStr);
	    	statement.setString(1, email);
	    	ResultSet rs = statement.executeQuery();
	    	if(rs.next()) {
	    		String savedhash = rs.getString("pwd");
	    		if(savedhash.equals(pwdhash)) {
	    			UUID uid = (UUID)rs.getObject("userid");
	    			return new User(conn, uid);	// could eliminate one DB query here
	    		} else {
	    			// wrong password
	    			return null;
	    		}
	    	} else {
	    		// no such user
	    		return null;
	    	}
		} catch(SQLException e) {
			logger.error("Failed to create new User: {}", e.getMessage());
			return null;
		} catch (NoSuchAlgorithmException e) {
			logger.error("Failed to create new User: {}", e.getMessage());
			return null;
		}
	}
	
	public User getUser(UUID userID) {
		try {
			return new User(conn, userID);
		} catch (Exception e) {
			logger.error("Failed to retrieve User with UID {}: {}", userID, e.getMessage());
			return null;
		}
	}
    
}
