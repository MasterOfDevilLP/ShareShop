package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.Item;
import shareshop.User;

public class CreateItemResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	@Expose
	public UUID id;
	
	public CreateItemResponse(Item item) {
		this.id = item.getItemID();
	}

}
