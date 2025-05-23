package shareshop.rest.requests;

import com.google.gson.annotations.*;

public class CreateUserRequest implements RequestBody {
	@Expose
	public String username;
	
	@Expose
	public String password;

	@Override
	public boolean validate() {
		if(username != null && password != null) {
			return true;
		}
		return false;
	}
}
