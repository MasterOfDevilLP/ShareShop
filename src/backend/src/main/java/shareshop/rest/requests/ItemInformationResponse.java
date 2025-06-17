package shareshop.rest.requests;

import java.math.BigDecimal;
import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.Item;
import shareshop.User;
import shareshop.WG;

public class ItemInformationResponse {
	
	@Expose 
	UUID iid;
	@Expose
	UUID wid;
	
	@Expose
	String name;
	@Expose
	String description;
	@Expose 
	BigDecimal price;
	
	public ItemInformationResponse(Item item) {
		wid = item.getWgID();
		iid = item.getItemID();
		
		name = item.getItemName();
		description = item.getItemDescription();
		price = item.getPrice();
	}
}
