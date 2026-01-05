package shareshop.rest.requests;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.User;

/**
 *	The response object for the endpoints GET /user
 */
public class UserInformationResponse {
	
	/**
	 * UUID of the user
	 */
	@Expose
	UUID uid;
	
	/**
	 * UUIDs of all the WGs the user is a member of
	 */
	@Expose
	ArrayList<UUID> wid;
	
	/**
	 * not set
	 */
	@Expose
	String firstname;
	/**
	 * not set
	 */
	@Expose
	String lastname;
	
	/**
	 * Construct a new user information response object
	 * @param user The user information should be taken from
	 * @throws SQLException Something went wrong in the database stuff
	 */
	public UserInformationResponse(User user) throws SQLException {
		uid = user.getUserID();
		wid = user.getWgIDList();
		
		firstname = user.getFirstName();
		lastname = user.getLastName();
	}
}
