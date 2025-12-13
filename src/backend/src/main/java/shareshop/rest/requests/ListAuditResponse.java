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

public class ListAuditResponse {
	
	class ItemChangeEntry{
		@Expose
		public long changeDate;
		@Expose
		public UUID iid;
		@Expose
		public int amount;
		@Expose
		public UUID uid;
		@Expose 
		public BigDecimal price;
		@Expose
		public ChangeEnum type;
		
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
	
	@Expose
	public ItemChangeEntry[] changes;
	
	public ListAuditResponse(ShoppingList slist) throws IllegalArgumentException, SQLException {
		var items = slist.getChangeLog(0, 1000); // TODO: temporary workaround to broken pagination
		this.changes = new ItemChangeEntry[items.size()];
		int idx = items.size() - 1;
		for(var p : items) {
			this.changes[idx--] = new ItemChangeEntry(p);
		}

	}

}
