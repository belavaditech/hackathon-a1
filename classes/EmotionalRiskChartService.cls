public with sharing class EmotionalRiskChartService {
    @AuraEnabled(cacheable=false)
    public static String getChartData(String activityType) {
        Map<String, Object> inputParams = new Map<String, Object>{
            'activity_type' => activityType
        };
        return PromptTemplateService.runPrompt('EmotionalRiskAnalysisPrompt', inputParams);
    }
}
