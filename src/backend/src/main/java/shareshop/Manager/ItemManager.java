package shareshop.Manager;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import shareshop.DBConnectionHandler;
import shareshop.Item;
import shareshop.User;
import shareshop.WG;

public class ItemManager {
	
	private DBConnectionHandler conn;
	Logger logger;
	
	public ItemManager(DBConnectionHandler conn) {
		this.conn = conn;
		logger = LoggerFactory.getLogger(getClass());
	}
	
	public Item createItem(WG wg, User user, String name, String description, BigDecimal price) {
		try {
			Item item = new Item(conn, wg, name, description, price);
			return item;
		} catch(SQLException e) {
			logger.warn("Failed to create item: {}", e.getMessage());
			return null;
		}
	}
	
	public Item getItem(UUID iid) {
		try {
			Item item = new Item(conn, iid);
			return item;
		} catch(SQLException e) {
			logger.warn("Failed to get item: {}", e.getMessage());
			return null;
		}
	}
	
	// TODO: actually make this a proper search. This is just a very gutted one (lists all items)
	public Item[] search(WG wg, String query) {
		try {
			PreparedStatement statement = conn.conn.prepareStatement("SELECT itemid FROM items WHERE wgid = ?");
			conn.conn.setAutoCommit(true);
			statement.setObject(1, wg.getWgID());
			ResultSet rs = statement.executeQuery(); 
			ArrayList<Item> items = new ArrayList<Item>();
			while(rs.next()) {
				UUID iid = (UUID)rs.getObject(1);
				items.add(new Item(conn, iid));
			}
			statement.close();
			return items.toArray(Item[]::new);
			
		} catch (SQLException e) {
			logger.error("Error searching items: {}", e.getMessage());
			return new Item[0];
		}
	}

}
