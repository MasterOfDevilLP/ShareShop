package shareshop;

/**
 * Main class of shareshop
 */
public class Main {
    /**
     * main function, initializes and runs the whole backend
     * @param args
     */
    public static void main(String[] args) {
        Config config = null;
        try {
            config = new ConfigLoader().loadConfig(args);
        } catch (RuntimeException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }
}