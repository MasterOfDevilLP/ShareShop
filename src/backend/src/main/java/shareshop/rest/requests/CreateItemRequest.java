package shareshop.rest.requests;

import java.math.BigDecimal;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint POST /wg/{wid}/item
 */
public class CreateItemRequest implements RequestBody {
	/**
	 * Name of the new item
	 */
	@Expose
	public String name;
	
	/**
	 * Description of the new item
	 */
	@Expose
	public String description;
	
	/**
	 * Price of the new item
	 */
	@Expose 
	public BigDecimal price;

	@Override
	public boolean validate() {
		if(name != null && description != null && name.length() > 0) {
			return true;
		}
		return false;
	}
}
