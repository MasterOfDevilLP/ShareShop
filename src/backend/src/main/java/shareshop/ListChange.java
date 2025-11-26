package shareshop;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.UUID;

public class ListChange {
    public enum ChangeEnum {
        ADDED,
        REMOVED,
        EDITED,
        CREATED,
        DELETED
    }
    private UUID shoppingListID;
    private int listChangeID;
    private ChangeEnum change;
    private Date changeDate;
    private UUID itemID;
    private String listName;
    private int amount;
    private UUID userID;
    private BigDecimal price;

    /**
     * Constructor of Class ListChange
     * @param shoppingListID
     * @param listChangeID
     * @param change
     * @param changeDate
     * @param itemID
     * @param listName
     * @param amount
     * @param userID
     * @param price
     */
    public ListChange(UUID shoppingListID, int listChangeID, ChangeEnum change, Date changeDate, UUID itemID, String listName, int amount, UUID userID, BigDecimal price) {
        this.shoppingListID = shoppingListID;
        this.listChangeID = listChangeID;
        this.change = change;
        this.changeDate = changeDate;
        this.itemID = itemID;
        this.amount = amount;
        this.userID = userID;
        this.price = price;
    }

    /**
     * get shoppinglist ID
     * @return shoppinglist ID
     */
    public UUID getShoppingListID() {return shoppingListID;}

    /**
     * get list change ID
     * @return list change ID
     */
    public int getListChangeID() {return listChangeID;}

    /**
     * get change
     * @return change
     */
    public ChangeEnum getChange() {return change;}

    /**
     * get change date
     * @return change date
     */
    public Date getChangeDate() {return changeDate;}

    /**
     * get item ID
     * @return item ID
     */
    public UUID getItemID() {return itemID;}

    /**
     * get list name
     * @return list name
     */
    public String getListName() {return listName;}

    /**
     * get amount
     * @return amount
     */
    public int getAmount() {return amount;}

    /**
     * get user ID
     * @return user ID
     */
    public UUID getUserID() {return userID;}

    /**
     * get price
     * @return price
     */
    public BigDecimal getPrice() {return price;}
}
