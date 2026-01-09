package shareshop.rest.requests;

import java.util.ArrayList;
import java.util.UUID;

import org.javatuples.Pair;

import com.google.gson.annotations.Expose;

import shareshop.Item;
import shareshop.ShoppingList;

/**
 *	The response object for the endpoint GET /wg/{wid}/list/{lid}/, also returned after changing a list, and when listing lists
 */
public class ListContentResponse {
	/**
	 * A single item on a list
	 */
	class ItemEntry{
		/**
		 * Amount of the item
		 */
		@Expose
		public int amount;
		/**
		 * Information for the item, to save more API requests
		 */
		@Expose
		public ItemInformationResponse item;
		
		/**
		 * Create a new ItemEntry
		 * @param amount Amount of the item
		 * @param item The item
		 */
		public ItemEntry(int amount, Item item) {
			this.amount = amount;
			this.item = new ItemInformationResponse(item);
		}
	}
	
	/**
	 * Array of the current list entries
	 */
	@Expose
	public ItemEntry[] items;
	
	/**
	 * Name of the list
	 */
	@Expose
	public String name;
	
	/**
	 * UUID of the list
	 */
	@Expose 
	UUID lid;
	
	/**
	 * Create a new response object for the ShoppingList content
	 * @param slist The ShoppingList
	 */
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
