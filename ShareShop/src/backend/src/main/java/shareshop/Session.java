package shareshop;

import java.time.LocalDateTime;

public class Session {
    private LocalDateTime lastUsed;
    private User user;

    /**
     * Constructor of Class Session
     * @param user
     */
    public Session(User user) {
        this.user = user;
        this.lastUsed = LocalDateTime.now();
    }

    /**
     * updates the last used Timestamp
     */
    public void boop() {
        this.lastUsed = LocalDateTime.now();
    }

    /**
     * closes the session (by removing the timestamp and thereforce making it invalid)
     */
    public void close() {
        this.lastUsed = null;
    }
}
