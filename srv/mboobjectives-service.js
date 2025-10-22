const cds = require('@sap/cds');
const { INSERT, SELECT, UPSERT } = cds.ql;

module.exports = cds.service.impl(async (srv) => {
    const db = await cds.connect.to('db');
    const { MboDetails } = srv.entities;

    srv.on('saveMBOObjectives', async (req) => {
        const mboData = req.data.mboData;
        mboData.forEach(item => {
            if (!item.objectiveId) {
                item.objectiveId = cds.utils.uuid(); // Assign a UUID to objectiveId
            }
        });
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
}); 