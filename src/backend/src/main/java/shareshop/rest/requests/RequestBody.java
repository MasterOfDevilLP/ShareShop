package shareshop.rest.requests;

/**
 * Interface for request objects
 */
public interface RequestBody {
	/**
	 * Validate the request object
	 * @return if the request body is valid or not
	 */
	public boolean validate();
}
