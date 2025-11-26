package shareshop.rest.requests;

import com.google.gson.annotations.*;

public class LoginRequest implements RequestBody {
	@Expose
	public String email;
	
	@Expose
	public String password;

	@Override
	public boolean validate() {
		if(email != null && password != null) {
			return true;
		}
		return false;
	}
}
