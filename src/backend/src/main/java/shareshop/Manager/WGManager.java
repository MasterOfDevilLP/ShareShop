package shareshop.Manager;

import java.sql.SQLException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import shareshop.DBConnectionHandler;
import shareshop.User;
import shareshop.WG;

public class WGManager {
	
	private DBConnectionHandler conn;
	Logger logger;
	
	public WGManager(DBConnectionHandler conn) {
		this.conn = conn;
		logger = LoggerFactory.getLogger(getClass());
	}
	
	public WG create(User owner, String name) throws SQLException, IllegalStateException {
		if(owner.getWgID() != null) {
			// since currently a user can only be in one wg, this is an issue
			logger.error("User is already in a WG");
			throw new IllegalStateException("User is already in a WG");
		}
		// TODO: ideally, this would be done in one transaction
		// currently, with an untimely crash, this can result in an orphan, which isn't ideal (it just takes up unnecessary storage)
		WG newwg = new WG(conn, name);
		owner.setWgID(conn, newwg.getWgID());
		
		return newwg;
	}
	
	public WG getWG(UUID wid) {
		try {
			return new WG(conn, wid);
		} catch(SQLException e) {
			logger.info("Failed to get WG: {}", e.getMessage());
		}
		return null;
	}
    
}
