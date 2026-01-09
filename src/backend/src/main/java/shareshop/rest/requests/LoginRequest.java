package shareshop.rest.requests;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint POST /user/login
 */
public class LoginRequest implements RequestBody {
	/**
	 * Email/username of the user
	 */
	@Expose
	public String email;
	
	/**
	 * Password of the user
	 */
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
