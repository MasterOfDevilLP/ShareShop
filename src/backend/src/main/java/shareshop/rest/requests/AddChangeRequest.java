package shareshop.rest.requests;

import java.math.BigDecimal;
import java.util.UUID;

import com.google.gson.annotations.*;

/**
 *	The request object for the endpoint POST /wg/{wid}/list/{lid}
 */
public class AddChangeRequest implements RequestBody {
	/**
	 * Type of change to add, can be "add", "remove", or "tick"
	 */
	@Expose
	public String type;
	
	/**
	 * ID of the item the change is for
	 */
	@Expose
	public UUID iid;
	
	/**
	 * Amount to change by
	 */
	@Expose
	public int amount;
	
	// this is optional, only used for type "tick"
	/**
	 * Price to save with the change, only relevant for type "tick"
	 */
	@Expose 
	public BigDecimal price;

	@Override
	public boolean validate() {
		if(type != null && iid != null && amount > 0 &&
				(type.equals("add") || type.equals("remove") || type.equals("tick"))) {
			return true;
		}
		return false;
	}
}
