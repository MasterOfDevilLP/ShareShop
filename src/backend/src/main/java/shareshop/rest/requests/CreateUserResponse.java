package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.User;

/**
 *	The response object for the endpoint POST /user/create
 */
public class CreateUserResponse {
	// unfortunately, Gson doesn't have inclusion strategies, only exclusion strategies, so this is a bit less error-prone
	
	/**
	 * UUID of the new user
	 */
	@Expose
	public UUID id;
	
	/**
	 * Construct a response object for a new user
	 * @param user the newly created user
	 */
	public CreateUserResponse(User user) {
		this.id = user.getUserID();
	}

}
