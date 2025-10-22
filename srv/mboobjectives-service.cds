namespace mboobjectives.srv;
using { mboobjectives.db as schema } from '../db/mboobjectives-schema';


service MboObjectives {
    entity MboDetails as projection on schema.mboscoring;

    type MboScoringItem : {
        territoryId     : String;
        position        : String;
        participantName : String;
        objectiveId     : UUID;
        objective       : String;
        mboWeightage    : Decimal;
        comments        : String;
        mboScore        : Decimal;
    };

    action saveMBOObjectives(mboData: array of MboScoringItem) returns String; 
}