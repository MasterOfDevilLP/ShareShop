package shareshop.rest.requests;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

import org.javatuples.Pair;

import com.google.gson.annotations.Expose;

import shareshop.DBConnectionHandler;
import shareshop.Item;
import shareshop.ListChange;
import shareshop.ListChange.ChangeEnum;
import shareshop.ShoppingList;

/**
 *	The response object for the endpoint GET /wg/{wid}/list/{lid}/audit
 */
public class ListAuditResponse {
	
	/**
	 * A single change
	 */
	class ItemChangeEntry{
		/**
		 * when the change took place
		 */
		@Expose
		public long changeDate;
		/**
		 * UUID of the item for which a change was posted
		 */
		@Expose
		public UUID iid;
		/**
		 * the amount changed by
		 */
		@Expose
		public int amount;
		/**
		 * UUID of the user who made the change
		 */
		@Expose
		public UUID uid;
		/**
		 * the price associated with the change, if set
		 */
		@Expose 
		public BigDecimal price;
		/**
		 * the type of the change
		 */
		@Expose
		public ChangeEnum type;
		
		/**
		 * Construct a new item change entry
		 * @param lChange the ListChange to take data from
		 */
		public ItemChangeEntry(ListChange lChange) {
			DateFormat df = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT, Locale.GERMAN);
			changeDate = lChange.getChangeDate().getTime();//df.format(lChange.getChangeDate());
			iid = lChange.getItemID();
			amount = lChange.getAmount();
			uid = lChange.getUserID();
			price = lChange.getPrice();
			type = lChange.getChange();
		}
	}
	
	/**
	 * An array containing all changes shown
	 */
	@Expose
	public ItemChangeEntry[] changes;
	
	/**
	 * Construct a new response object for the audit log for a specific ShoppingList, containing the last 1000 entries
	 * @param slist the audited shopping list
	 * @throws IllegalArgumentException shouldn't really happen
	 * @throws SQLException something probably went wrong with the Database
	 */
	public ListAuditResponse(ShoppingList slist) throws IllegalArgumentException, SQLException {
		var items = slist.getChangeLog(0, 1000); // TODO: temporary workaround to broken pagination
		this.changes = new ItemChangeEntry[items.size()];
		int idx = items.size() - 1;
		for(var p : items) {
			this.changes[idx--] = new ItemChangeEntry(p);
		}

	}

}
