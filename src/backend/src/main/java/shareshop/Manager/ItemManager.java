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

/**
 * Class which contains some wrappers around some item functionality.
 * Still partially directly interacts with the database unfortunately.
 */
public class ItemManager {
	
	private DBConnectionHandler conn;
	Logger logger;
	
	/**
	 * Create a new ItemManager
	 * @param conn the DBConnectionHandler to use
	 */
	public ItemManager(DBConnectionHandler conn) {
		this.conn = conn;
		logger = LoggerFactory.getLogger(getClass());
	}
	
	/**
	 * Create a new item
	 * @param wg the WG to create the item for
	 * @param user	the user who created the item
	 * @param name the name of the item
	 * @param description the description of the item
	 * @param price the price of the item
	 * @return the new item, or null if creation failed
	 */
	public Item createItem(WG wg, User user, String name, String description, BigDecimal price) {
		try {
			Item item = new Item(conn, wg, name, description, price);
			return item;
		} catch(SQLException e) {
			logger.warn("Failed to create item: {}", e.getMessage());
			return null;
		}
	}
	
	/**
	 * Get an item by its UUID
	 * @param iid the UUID of the item
	 * @return the requested item, or null if it doesn't exist
	 */
	public Item getItem(UUID iid) {
		try {
			Item item = new Item(conn, iid);
			return item;
		} catch(SQLException e) {
			logger.warn("Failed to get item: {}", e.getMessage());
			return null;
		}
	}
	
	/**
	 * Search for items in a WG. Currently stubbed and just returns all items
	 * @param wg the WG to search in
	 * @param query the search query
	 * @return an array of all search results, may be empty
	 */
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
