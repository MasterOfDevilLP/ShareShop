package shareshop.rest.requests;

import java.time.LocalDate;
import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.User;
import shareshop.WG;

/**
 *	The response object for the endpoint GET /wg/{wid} 
 */
public class WGInformationResponse {
	/**
	 * UUID of the WG
	 */
	@Expose
	UUID wid;
	
	/**
	 * Name of the WG
	 */
	@Expose
	String name;
	/**
	 * Creation date of the WG
	 */
	@Expose
	String creationDate;
	
	/**
	 * Construct a new WG information response object
	 * @param wg Relevant WG
	 */
	public WGInformationResponse(WG wg) {
		wid = wg.getWgID();
		
		name = wg.getWgName();
		
		creationDate = wg.getCreationDate().toLocalDate().toString();
	}
}
