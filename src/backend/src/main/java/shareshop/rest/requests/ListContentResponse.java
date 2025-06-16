package shareshop.rest.requests;

import java.util.ArrayList;
import java.util.UUID;

import org.javatuples.Pair;

import com.google.gson.annotations.Expose;

import shareshop.Item;
import shareshop.ShoppingList;

public class ListContentResponse {
	
	class ItemEntry{
		@Expose
		public int amount;
		@Expose
		public ItemInformationResponse item;
		
		public ItemEntry(int amount, Item item) {
			this.amount = amount;
			this.item = new ItemInformationResponse(item);
		}
	}
	
	@Expose
	public ItemEntry[] items;
	
	@Expose
	public String name;
	
	@Expose 
	UUID lid;
	
	public ListContentResponse(ShoppingList slist) {
		var items = slist.getItemsOnList();
		this.items = new ItemEntry[items.size()];
		int idx = 0;
		for(var p : items) {
			this.items[idx++] = new ItemEntry(p.getValue1(), p.getValue0());
		}
		this.name = slist.getName();
		this.lid = slist.getShoppingListId();
	}

}
