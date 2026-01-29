package shareshop.rest.requests;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import com.google.gson.annotations.*;

public class CreateInviteRequest implements RequestBody {
	@Expose
	public UUID forUser;
	
	@Expose
	public Long expires;
	
	@Override
	public boolean validate() {
		if(expires == null) {
			expires = -1l;
		}
		return true;
	}
}
