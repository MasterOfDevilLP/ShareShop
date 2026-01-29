package shareshop.rest.requests;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint PATCH /wg/{wid}/list/{lid}
 *  Only fields which are present in the request are considered, all others are just ignored
 */
public class PatchListRequest implements RequestBody {
	/**
	 * New name of the list
	 */
	@Expose
	public String name;
	
	@Override
	public boolean validate() {
		if(name != null && name.length() == 0 && name.length() <= 25) {
			return false;
		}
		return true;
	}
}
