package shareshop;

import java.math.BigDecimal;
import java.sql.Date;

public class ListChange {
    public enum ChangeEnum {
        ADDED,
        REMOVED,
        EDITED,
        CREATED,
        DELETED
    }
    private String shoppingListID;
    private int listChangeID;
    private ChangeEnum change;
    private Date changeDate;
    private String itemID;
    private String listName;
    private int amount;
    private String userID;
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
    public ListChange(String shoppingListID, int listChangeID, ChangeEnum change, Date changeDate, String itemID, String listName, int amount, String userID, BigDecimal price) {
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
    public String getShoppingListID() {return shoppingListID;}

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
    public String getItemID() {return itemID;}

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
    public String getUserID() {return userID;}

    /**
     * get price
     * @return price
     */
    public BigDecimal getPrice() {return price;}
}
