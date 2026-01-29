package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.User;
import shareshop.WG;

/**
 *	The response object for the endpoint POST /wg/create
 */
public class CreateWGResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	/**
	 * UUID of the new WG
	 */
	@Expose
	public UUID id;
	
	/**
	 * Construct a response object for the new WG
	 * @param wg the newly created WG
	 */
	public CreateWGResponse(WG wg) {
		this.id = wg.getWgID();
	}

}
