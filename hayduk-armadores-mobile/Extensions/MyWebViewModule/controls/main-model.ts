import { Observable } from '@nativescript/core/data/observable';

export class oModel extends Observable {
    private list : any;
    constructor() {
        super();
        this.initData();
    }
    
   private initData() {
        this.set("SalesOrderHeader",
            [{ SalesOrderId: "4500001", Amount: 10 }]); // Dummy record
        this.list = this.get( "SalesOrderHeader" );
    }
   
   private setSalesOrderHeader( SalesOrderId, Amount ){
   		this.list.push({ "SalesOrderId": SalesOrderId , "Amount" : Amount });
   }
   
   private getSalesOrderHeader(){
   		return this.list;
   }
}