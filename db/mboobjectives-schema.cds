namespace mboobjectives.db;
using { cuid, managed } from '@sap/cds/common';

entity mboscoring : cuid, managed {
    rootId: UUID;
    territoryId: String;
    objectiveId: UUID;
    position: String;
    participantName: String;
    objective: String;
    mboWeightage: Integer;
    comments: String;
    mboScore: Integer;
}
entity caseapprovals : cuid, managed {
    rootId: UUID;
    caseId: UUID;
    caseName: String;
    priority: String;
    description: String;
    submittedBy: String;
    submittedDate: DateTime;
    assigneeTitle: String;
    assignedTo: String;
    assignedDate: DateTime;
    approvalDate: DateTime;
    approvalComments: String;
    status: String;
}
entity casecomments : cuid, managed {
    caseId: UUID;
    commentId: UUID;
    commentBy: String;
    commentText: String;
    commentDate: DateTime;
}