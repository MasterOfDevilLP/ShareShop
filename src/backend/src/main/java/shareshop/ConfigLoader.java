package shareshop;

import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

import com.google.gson.*;


/**
 * Class for loading the backend config
 */
public class ConfigLoader {
    private static final String DEFAULT_CONFIG_PATH = "/config.json";
    private Gson gson = new Gson();

    /**
     * loads the config from a given file or the default config
     * @param args
     * @return config
     */
    public Config loadConfig(String[] args) {
        // test
        String configFile = args.length > 0 ? args[0] : null;

        try {
            if (configFile != null && Files.exists(Paths.get(configFile))) {
                FileInputStream fis = new FileInputStream(configFile);
                String content = new String(fis.readAllBytes());
                fis.close();
                return gson.fromJson(content, Config.class);
            } else {
                try (InputStream is = ConfigLoader.class.getResourceAsStream(DEFAULT_CONFIG_PATH)) {
                    System.out.println("no given configfile, using default config"); // TODO: logging
                    if (is == null)
                    {
                        throw new RuntimeException("Couldn't open default configuration");
                    }
                    String content = new String(is.readAllBytes());
                    return gson.fromJson(content, Config.class);
                }
            }
        } catch (Exception e)
        {
            e.printStackTrace();
            throw new RuntimeException("Configurationerror: " + e.getMessage(), e);
        }
    }
}
