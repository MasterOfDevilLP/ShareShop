package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.Invite;

public class CreateInviteResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	@Expose
	public UUID id;
	
	public CreateInviteResponse(Invite inv) {
		this.id = inv.getToken();
	}

}
