package shareshop.rest.requests;

import com.google.gson.annotations.*;

public class CreateWGRequest implements RequestBody {
	@Expose
	public String name;
	
	@Override
	public boolean validate() {
		if(name != null) {
			return true;
		}
		return false;
	}
}
