package shareshop.rest.requests;

import java.math.BigDecimal;
import java.util.UUID;

import com.google.gson.annotations.*;

public class AddChangeRequest implements RequestBody {
	@Expose
	public String type;
	
	@Expose
	public UUID iid;
	
	@Expose
	public int amount;
	
	// this is optional, only used for type "tick"
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
