package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.ShoppingList;
import shareshop.User;

/**
 *	The response object for the endpoint POST /wg/{wid}/list
 */
public class CreateListResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	/**
	 * UUID of the newly created list
	 */
	@Expose
	public UUID id;
	
	/**
	 * Construct a response object for the new list
	 * @param list the newly created list
	 */
	public CreateListResponse(ShoppingList list) {
		this.id = list.getShoppingListId();
	}

}
