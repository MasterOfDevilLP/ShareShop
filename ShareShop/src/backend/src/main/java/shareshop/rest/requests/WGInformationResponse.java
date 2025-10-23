package shareshop.rest.requests;

import java.time.LocalDate;
import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.User;
import shareshop.WG;

public class WGInformationResponse {
	
	@Expose
	UUID wid;
	
	@Expose
	String name;
	@Expose
	String creationDate;
	
	public WGInformationResponse(WG wg) {
		wid = wg.getWgID();
		
		name = wg.getWgName();
		
		creationDate = wg.getCreationDate().toLocalDate().toString();
	}
}
