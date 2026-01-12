package shareshop.rest.requests;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint POST /wg/{wid}/list
 */
public class CreateListRequest implements RequestBody {
	/**
	 * Name of the new list
	 */
	@Expose
	public String name;
	
	@Override
	public boolean validate() {
		if(name != null && name.length() > 0 && name.length() <= 25) {
			return true;
		}
		return false;
	}
}
