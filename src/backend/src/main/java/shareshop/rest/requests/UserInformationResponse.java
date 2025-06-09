package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.User;

public class UserInformationResponse {
	
	@Expose
	UUID uid;
	
	@Expose
	UUID wid;
	
	@Expose
	String firstname;
	@Expose
	String lastname;
	
	public UserInformationResponse(User user) {
		uid = user.getUserID();
		wid = user.getWgID();
		
		firstname = user.getFirstName();
		lastname = user.getLastName();
	}
}
