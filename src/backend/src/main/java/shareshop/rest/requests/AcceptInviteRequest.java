package shareshop.rest.requests;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import com.google.gson.annotations.*;

public class AcceptInviteRequest implements RequestBody {
	@Expose
	public UUID id;
	
	@Override
	public boolean validate() {
		if(id == null) {
			return false;
		}
		return true;
	}
}
