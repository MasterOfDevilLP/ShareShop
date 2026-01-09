package shareshop.rest.requests;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint PATCH /wg/{wid}
 *  Only fields which are present in the request are considered, all others are just ignored
 */
public class PatchWGRequest implements RequestBody {
	// all fields are optional, whatever is present will then be changed
	/**
	 * New name of the WG
	 */
	@Expose
	public String name;
	
	@Override
	public boolean validate() {
		// TODO: properly validate (and potentially sanitise) the name 
		if(name != null && name.length() == 0) {
			return false;
		}
		return true;
	}
}
