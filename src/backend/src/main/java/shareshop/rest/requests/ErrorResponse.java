package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.Item;
import shareshop.User;

/**
 * A generic response object for API errors. 
 */
public class ErrorResponse {
	/**
	 * The error message to return. Can be anything.
	 */
	@Expose
	public String message;
	
	/**
	 * Construct a new response for an error.
	 * @param message The error message to return. Can be anything.
	 */
	public ErrorResponse(String message) {
		this.message = message;
	}

}
