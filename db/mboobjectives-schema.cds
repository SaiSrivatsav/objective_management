namespace mboobjectives.db;
using { cuid, managed } from '@sap/cds/common';

entity mboscoring : cuid, managed {
    territoryId: String;
    objectiveId: UUID;
    position: String;
    participantName: String;
    objective: String;
    mboWeightage: Integer;
    comments: String;
    mboScore: Integer;
}