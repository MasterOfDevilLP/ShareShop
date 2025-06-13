package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.User;
import shareshop.WG;

public class CreateWGResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	@Expose
	public UUID id;
	
	public CreateWGResponse(WG wg) {
		this.id = wg.getWgID();
	}

}
