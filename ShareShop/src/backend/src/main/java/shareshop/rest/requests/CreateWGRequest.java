package shareshop.rest.requests;

import com.google.gson.annotations.*;

public class CreateWGRequest implements RequestBody {
	@Expose
	public String name;
	
	@Override
	public boolean validate() {
		// TODO: properly validate (and potentially sanitise) the name 
		if(name != null && name.length() > 0) {
			return true;
		}
		return false;
	}
}
