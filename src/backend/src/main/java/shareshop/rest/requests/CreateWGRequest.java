package shareshop.rest.requests;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint POST /wg/create
 */
public class CreateWGRequest implements RequestBody {
	/**
	 * Name of the new WG
	 */
	@Expose
	public String name;
	
	@Override
	public boolean validate() {
		// TODO: properly validate (and potentially sanitise) the name 
		if(name != null && name.length() > 0 && name.length() <= 16) {
			return true;
		}
		return false;
	}
}
