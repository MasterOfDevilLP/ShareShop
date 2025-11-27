package shareshop.rest.requests;

import java.sql.Timestamp;
import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.Invite;

public class GetInviteAsMemberResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	@Expose
	public UUID forUser;
	@Expose
	public Long expires;
	@Expose
	public long created;
	
	public GetInviteAsMemberResponse(Invite inv) {
		this.forUser = inv.getUserID();
		Timestamp exp = inv.getExpiryDateTime();
		expires = exp == null ? null : exp.getTime() / 1000l;
		created = inv.getCreationDateTime().getTime() / 1000l;
	}

}
