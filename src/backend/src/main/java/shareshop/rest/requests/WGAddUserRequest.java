package shareshop.rest.requests;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint POST /wg/{wid}/user 
 */
public class WGAddUserRequest implements RequestBody {
	/**
	 * UUID of the user to add
	 */
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
