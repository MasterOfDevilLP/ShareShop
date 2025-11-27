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
		}/* else {
			long now = Instant.now().toEpochMilli();
			if(expires <= now) {
				// expires in the past
				return false;
			}
		}*/
		return true;
	}
}
