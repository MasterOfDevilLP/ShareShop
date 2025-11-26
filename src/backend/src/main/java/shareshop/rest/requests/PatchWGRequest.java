package shareshop.rest.requests;

import com.google.gson.annotations.*;

public class PatchWGRequest implements RequestBody {
	// all fields are optional, whatever is present will then be changed
	@Expose
	public String name;
	
	@Override
	public boolean validate() {
		// TODO: properly validate (and potentially sanitise) the name 
		if(name != null && name.length() == 0) {
			return false;
		}
		return true;
	}
}
