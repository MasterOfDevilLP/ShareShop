package shareshop;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

import shareshop.User;

// notiz an mich selbst:
// Objekte nicht mocken sondern in BeforeAll mit eigenen queries auf der Datenbank aufsetzen
// beim testen vom schreiben auf die Datenbank dann selber mit queries testen (oder abfrage funktionen vorher testen und als abhängigkeit einstellen)

public class TCUser {
    
    @BeforeAll
    static void setUpBeforeClass() {

    }

    @AfterAll
    static void tearDownAfterClass() {

    }
}