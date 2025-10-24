package shareshop.rest.requests;

import java.util.UUID;

import com.google.gson.annotations.Expose;

import shareshop.Item;
import shareshop.User;

public class ErrorResponse {
	
	@Expose
	public String message;
	
	public ErrorResponse(String message) {
		this.message = message;
	}

}
