namespace com.everis;

context suppliers {
    entity Master {
        key id          : Integer;
            code        : String(30);
            tableName   : String(50);
            valueLow    : String(200);
            valueHigh   : String(200);
            description : String(1000);
            level       : Integer;
            state       : Integer;
    }
}
