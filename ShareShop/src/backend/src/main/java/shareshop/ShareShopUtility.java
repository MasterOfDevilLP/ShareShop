package shareshop;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class ShareShopUtility {

    /**
     * generates a new UUID with the gen_random_uuid() function from the PostgreSQL database
     * @param connectionHandler
     * @return  uuid as a string
     * @throws SQLException
     */
    public static String genNewUUID(DBConnectionHandler connectionHandler) throws SQLException {
        connectionHandler.makeSureItsOpen();
        Statement stmt = connectionHandler.conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT gen_random_uuid()");
        String uuid = null;
        while (rs.next()) {
            uuid = rs.getString(1);
            break;
        }
        stmt.close();
        return uuid;
    }
}
