public with sharing class StrategyService {
    @AuraEnabled(cacheable=true)
    public static Strategy__c getStrategy(Id strategyId) {
        return [
            SELECT Emotional_data__c, Description__c, Business_data__c,Legal_data__c
            FROM Strategy__c
            WHERE Id = :strategyId
            LIMIT 1
        ];
    }
}
