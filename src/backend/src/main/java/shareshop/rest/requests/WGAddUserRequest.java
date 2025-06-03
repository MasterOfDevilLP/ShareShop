package shareshop.rest.requests;

import com.google.gson.annotations.*;

public class WGAddUserRequest implements RequestBody {
	@Expose
	public String id;
	
	@Override
	public boolean validate() {
		// TODO: validate that it's a proper UUID
		if(id != null) {
			return true;
		}
		return false;
	}
}
