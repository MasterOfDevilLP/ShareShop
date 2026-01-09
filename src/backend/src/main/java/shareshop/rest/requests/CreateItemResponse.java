package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.Item;
import shareshop.User;

/**
 *	The response object for the endpoint POST /wg/{wid}/item
 */
public class CreateItemResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	/**
	 * UUID of the newly created item
	 */
	@Expose
	public UUID id;
	
	/**
	 * Construct a new response
	 * @param item the newly created item
	 */
	public CreateItemResponse(Item item) {
		this.id = item.getItemID();
	}

}
