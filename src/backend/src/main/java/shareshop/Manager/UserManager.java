package shareshop.Manager;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.HexFormat;

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
	
	public void login() {
		
	}
	
	public void getUser(String userID) {
		
	}
    
}
