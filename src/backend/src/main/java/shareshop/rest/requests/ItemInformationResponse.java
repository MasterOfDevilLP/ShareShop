package shareshop.rest.requests;

import java.math.BigDecimal;
import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.Item;
import shareshop.User;
import shareshop.WG;

/**
 *	The response object for the endpoints GET /wg/{wid}/item and GET /wg/{wid}/item/{iid} 
 */
public class ItemInformationResponse {
	/**
	 * UUID of the item
	 */
	@Expose 
	UUID iid;
	/**
	 * UUID of the WG the item belongs to
	 */
	@Expose
	UUID wid;
	
	/**
	 * name of the item
	 */
	@Expose
	String name;
	/**
	 * description of the item
	 */
	@Expose
	String description;
	/**
	 * price of the item
	 */
	@Expose 
	BigDecimal price;
	
	/**
	 * construct a new response object for an item
	 * @param item the item to take the information from
	 */
	public ItemInformationResponse(Item item) {
		wid = item.getWgID();
		iid = item.getItemID();
		
		name = item.getItemName();
		description = item.getItemDescription();
		price = item.getPrice();
	}
}
