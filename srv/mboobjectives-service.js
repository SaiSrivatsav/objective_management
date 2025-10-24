const cds = require('@sap/cds');
const { INSERT, SELECT, UPSERT } = cds.ql;

module.exports = cds.service.impl(async (srv) => {
    const db = await cds.connect.to('db');
    const { MboDetails } = srv.entities;

    srv.on('saveMBOObjectives', async (req) => {
        const mboData = req.data.mboData;
        const rootId = cds.utils.uuid();
        console.log('MBO Data:', + JSON.stringify(mboData));
        mboData.forEach(item => {
            if (!item.objectiveId) {
                item.objectiveId = cds.utils.uuid(); // Assign a UUID to objectiveId
                item.rootId = rootId; // Assign the same UUID to rootId
            }
        });
        console.log('MBO Data saving:', + JSON.stringify(mboData));
        try {
            await db.run(DELETE.from('mboobjectives.db.mboscoring').where({ territoryId: mboData[0].territoryId }));
            console.log('Existing MBO Objectives deleted for territoryId:', mboData[0].territoryId);
            console.log('Saving MBO Objectives:', JSON.stringify(mboData));
            await db.run(INSERT.into('mboobjectives.db.mboscoring').entries(mboData));
            return { message: 'MBO Objectives saved successfully' };
        } catch (error) {
            req.error(500, `Error saving MBO Objectives: ${error.message}`);
        }
    });

    srv.on('createCase', async (req) => {
        const caseDetails = req.data.caseDetails;
        const caseId = cds.utils.uuid();
        const rootId = await db.run(SELECT.one.from('mboobjectives.db.mboscoring').columns('rootId').where({ objectiveId: caseDetails[0].objectiveId }));
        console.log('Creating case with details:', rootId.rootId);
        try {
            const users = [
                {
                    id: 'ssrivatsav@syzygysol.com',
                    name: 'Sai Srivatsav',
                    role: 'Administrator'
                },
                {
                    id: 'naresha@syzygysol.com',
                    name: 'Naresh',
                    role: 'Administrator'
                },
                {
                    id: 'asant@syzygysol.com',
                    name: 'Abhijit',
                    role: 'Administrator'
                }
            ];
            const caseTx = db.tx();
            const caseapprovals = users.map(item => ({
                rootId: rootId.rootId,
                caseId: caseId,
                caseName: caseDetails[0].caseName,    
                priority: caseDetails[0].priority,
                description: caseDetails[0].description,
                submittedBy: req.user.id,
                submittedDate: new Date(),
                assigneeTitle: '',
                assignedTo: item.id,
                assignedDate: new Date(),
                approvalDate: null,
                approvalComments: null,
                status: 'Pending for action'
            }));
            console.log('Inserting case approvals:', JSON.stringify(caseapprovals));
            await caseTx.run(INSERT.into('mboobjectives.db.caseapprovals').entries(caseapprovals));
            await caseTx.commit();
            return { message: 'Case created and MBO Objectives updated successfully' };
        } catch (error) {
            console.error('Error creating case:', error);
            req.error(500, `Error creating case: ${error.message}`);
        }
    });

    srv.on('getAllCases', async (req) => {
        console.log('Fetching all cases for user:', req.user.id);
        try {
            const result = await db.run(SELECT.from('mboobjectives.db.caseapprovals'));
            const userCases = result.filter(item => item.assignedTo === req.user.id);
            if (userCases.length > 0) {
                const allCases = userCases.map(obj => obj.rootId);
                const objectives = await db.run(SELECT.from('mboobjectives.db.mboscoring').where({ rootId: { in: allCases } }));
                userCases.forEach(caseItem => {
                    caseItem.objectives = objectives.filter(obj => obj.rootId === caseItem.rootId);
                });
            }
            console.log('Cases fetched for user:', JSON.stringify(userCases));
            return userCases;
        } catch (error) {
            console.error('Error fetching all cases:', error);
            req.error(500, `Error fetching all cases: ${error.message}`);
        }
    });
}); 