package shareshop.rest.requests;

import java.math.BigDecimal;

import com.google.gson.annotations.*;

public class CreateItemRequest implements RequestBody {
	@Expose
	public String name;
	
	@Expose
	public String description;
	
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
