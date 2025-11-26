package shareshop.rest.requests;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.User;

public class UserInformationResponse {
	
	@Expose
	UUID uid;
	
	@Expose
	ArrayList<UUID> wid;
	
	@Expose
	String firstname;
	@Expose
	String lastname;
	
	public UserInformationResponse(User user) throws SQLException {
		uid = user.getUserID();
		wid = user.getWgIDList();
		
		firstname = user.getFirstName();
		lastname = user.getLastName();
	}
}
