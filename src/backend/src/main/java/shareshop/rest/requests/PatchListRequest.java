package shareshop.rest.requests;

import com.google.gson.annotations.*;

public class PatchListRequest implements RequestBody {
	@Expose
	public String name;
	
	@Override
	public boolean validate() {
		if(name != null && name.length() == 0) {
			return false;
		}
		return true;
	}
}
