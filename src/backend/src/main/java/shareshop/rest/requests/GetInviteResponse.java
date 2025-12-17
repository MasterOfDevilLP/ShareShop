package shareshop.rest.requests;

import java.sql.Timestamp;
import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.AppContext;
import shareshop.Invite;
import shareshop.WG;
import shareshop.Manager.WGManager;

public class GetInviteResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	@Expose
	public String wgname;
	@Expose
	public boolean once;
	@Expose
	public boolean personal;
	
	public GetInviteResponse(Invite inv, WG wg) {
		this.wgname = wg.getWgName();
		once = inv.getUserID() != null;
		personal = inv.getUserID() != null;
	}

}
