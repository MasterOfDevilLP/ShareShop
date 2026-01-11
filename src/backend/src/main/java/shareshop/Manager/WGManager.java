package shareshop.Manager;

import java.sql.SQLException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import shareshop.DBConnectionHandler;
import shareshop.User;
import shareshop.WG;

/**
 * Helper class for handling WGs
 */
public class WGManager {
	
	private DBConnectionHandler conn;
	Logger logger;
	
	/**
	 * Create a new WGManager
	 * @param conn the DBConnection to use
	 */
	public WGManager(DBConnectionHandler conn) {
		this.conn = conn;
		logger = LoggerFactory.getLogger(getClass());
	}
	
	/**
	 * create a new WG
	 * @param owner the owner of the new WG (the user who is creating it)
	 * @param name the name of the WG
	 * @return the new WG
	 * @throws SQLException something went wrong creating the new WG
	 */
	public WG create(User owner, String name) throws SQLException {
		// TODO: ideally, this would be done in one transaction
		// currently, with an untimely crash, this can result in an orphan, which isn't ideal (it just takes up unnecessary storage)
		WG newwg = new WG(conn, name);
		newwg.addUser(owner);
		
		return newwg;
	}
	
	/**
	 * Get a WG by UUID
	 * @param wid the UUID of the WG
	 * @return the requested WG, or null if none exists or an error occurred
	 */
	public WG getWG(UUID wid) {
		try {
			return new WG(conn, wid);
		} catch(SQLException e) {
			logger.info("Failed to get WG: {}", e.getMessage());
		}
		return null;
	}
    
}
