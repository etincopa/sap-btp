using {com.everis as db} from '../db/schema';

@path : '/Service'
//@requires : 'authenticated-user'
service Service @(requires : 'authenticated-user') {
    entity MasterSet as projection on db.suppliers.Master;
}