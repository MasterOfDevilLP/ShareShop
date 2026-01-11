package shareshop.rest.requests;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint POST /user/create
 */
public class CreateUserRequest implements RequestBody {
	/**
	 * Email/username for the new user
	 */
	@Expose
	public String email;
	
	/**
	 * Password for the new user
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
