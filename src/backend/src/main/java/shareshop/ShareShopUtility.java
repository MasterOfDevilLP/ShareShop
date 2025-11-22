package shareshop;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Time;

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

    /**
     * adds an amount of time (in milliseconds) to the startingTime timestamp and returns new Timestamp
     * @param startingTime
     * @param timeToAdd (in milliseconds)
     * @return Timestamp
     */
    public static Timestamp createTimestampInAmountOfTime(Timestamp startingTime, long timeToAdd) {
        return new Timestamp(startingTime.getTime() + timeToAdd);
    }
}
