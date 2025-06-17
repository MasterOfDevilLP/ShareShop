package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.ShoppingList;
import shareshop.User;

public class CreateListResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	@Expose
	public UUID id;
	
	public CreateListResponse(ShoppingList list) {
		this.id = list.getShoppingListId();
	}

}
