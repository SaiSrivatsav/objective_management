namespace mboobjectives.srv;
using { mboobjectives.db as schema } from '../db/mboobjectives-schema';


service MboObjectives {
    entity MboDetails as projection on schema.mboscoring;
    entity CaseList as projection on schema.caseapprovals;
    entity CaseComments as projection on schema.casecomments;

    type MboScoringItem : {
        territoryId     : String;
        position        : String;
        participantName : String;
        objectiveId     : UUID;
        objective       : String;
        mboWeightage    : Decimal;
        comments        : String;
        mboScore        : Decimal;
        rootId          : UUID;
    };

    type CaseDetails:{
        territoryId     : String;       
        position        : String;
        participantName : String;
        objectiveId     : UUID;
        objective       : String;
        mboWeightage    : Decimal;
        comments        : String;
        mboScore        : Decimal;
        caseId          : UUID;
        caseName        : String;
        description     : String;
        priority        : String;
        rootId          : UUID; 
    };

    action saveMBOObjectives(mboData: array of MboScoringItem) returns String;
    action createCase(caseDetails: array of CaseDetails) returns String;
    function getAllCases() returns array of CaseList;
}