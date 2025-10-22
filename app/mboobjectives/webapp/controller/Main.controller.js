sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (Controller, MessageToast, BusyIndicator, Fragment, JSONModel, MessageBox) => {
    "use strict";

    return Controller.extend("mboobjectives.controller.Main", {
        onInit() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteMain").attachPatternMatched(this._onObjectMatched, this);
        },
        async _onObjectMatched() {
            this._i18nModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this.getOwnerComponent().getModel("MboDetails").setData([]);
            this.getOwnerComponent().getModel("Participants").setData([]);
            BusyIndicator.show();
            await this.getParticipants();
            BusyIndicator.hide();
        },

        async getParticipants() {
            const oParticipantsModel = this.getView().getModel("Participants");
            oParticipantsModel.setData([]);
            oParticipantsModel.setSizeLimit(1000);
            const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(this.getOwnerComponent().getManifestEntry("sap.app").dataSources.commissionsService.uri);
            var allParticipantsMap = [];
            let skip = 0;
            const top = 100;
            let hasMore = true;
            try {
                while (hasMore) {
                    const response = await fetch(`${sUrl}/participants?skip=${skip}&top=${top}`, {
                        method: "GET",
                        contentType: "application/json",
                        dataType: "json"
                    });
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    const oData = await response.json();
                    const participants = Array.isArray(oData.participants) ? oData.participants : oData.value || [];
                    if (participants.length > 0) {
                        allParticipantsMap.push(...participants);
                    }
                    if (participants.length < top) {
                        hasMore = false;
                    } else {
                        skip += top;
                    }
                }
                oParticipantsModel.setData(allParticipantsMap.flat());
            } catch (error) {
                BusyIndicator.hide();
                MessageBox.error("Error fetching participants:", error);
                console.error("Error fetching participants:", error);
            }
        },

        async onTerritoryChange(oEvent) {
            const oParticipantsModel = this.getView().getModel("Participants");
            const sSelectedTerritory = oEvent.getSource().getSelectedKey();
            const selectedParticipant = oParticipantsModel.getData().filter(participant => participant.userId === sSelectedTerritory);
            this.getView().byId("idParticipantName").setText(selectedParticipant.length > 0 ? selectedParticipant[0].firstName + " " + selectedParticipant[0].lastName : "");
            this.getView().byId("idTargetComp").setText(selectedParticipant.length > 0 ? selectedParticipant[0]?.salary?.value + " " + selectedParticipant[0]?.salary?.unitType?.name : "");
            const position = await this.getPosition(selectedParticipant[0].payeeSeq);
            if (position) {
                this.getView().byId("idPosition").setText(position);
            }
            await this.getMboDetails(sSelectedTerritory);
        },

        async getMboDetails(participantID) {
            const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(this.getOwnerComponent().getManifestEntry("sap.app").dataSources.mainService.uri);
            try {
                BusyIndicator.show();
                const response = await fetch(`${sUrl}/MboDetails?$filter=territoryId eq '${participantID}'`, {
                    method: "GET",
                    contentType: "application/json",
                    dataType: "json"
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const oData = await response.json();
                const mbos = Array.isArray(oData.mbos) ? oData.mbos : oData.value || [];
                const oMboModel = this.getView().getModel("MboDetails");
                oMboModel.setData(mbos);
                BusyIndicator.hide();
                // Process MBOs as needed
            } catch (error) {
                BusyIndicator.hide();
                MessageBox.error("Error fetching MBO details:", error);
                console.error("Error fetching MBO details:", error);
            }
        },

        onSaveObjectives(oEvent){
            const oModel = this.getView().getModel("MboDetails");
            const aData = oModel.getData();
            const saveData = [];
            for (let i = 0; i < aData.length; i++) {
                const item = aData[i];
                saveData.push({
                    territoryId: this.getView().byId("idTerritoryId").getSelectedKey(),
                    position: this.getView().byId("idPosition").getText(),
                    participantName: this.getView().byId("idParticipantName").getText(),
                    objectiveId: item.objectiveId || null,
                    objective: item.objective,
                    mboWeightage: item.mboWeightage,
                    comments: item.comments,
                    mboScore: item.mboScore
                });
            }
            const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(this.getOwnerComponent().getManifestEntry("sap.app").dataSources.mainService.uri);
            BusyIndicator.show();
            fetch(`${sUrl}/saveMBOObjectives`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ mboData: saveData })
            })
            .then(response => {
                BusyIndicator.hide();
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                MessageToast.show("MBO Objectives saved successfully");
            })
            .catch(error => {
                BusyIndicator.hide();
                MessageBox.error("Error saving MBO details:", error);
                console.error("Error saving MBO details:", error);
            });
        },

        async getPosition(positionID) {
            const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(this.getOwnerComponent().getManifestEntry("sap.app").dataSources.commissionsService.uri);
            try {
                const response = await fetch(`${sUrl}/positions?$filter=payee eq '${positionID}'`, {
                    method: "GET",
                    contentType: "application/json",
                    dataType: "json"
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const oData = await response.json();
                const positions = Array.isArray(oData.positions) ? oData.positions : oData.value || [];
                return positions[positions.length - 1].description;

            } catch (error) {
                BusyIndicator.hide();
                MessageBox.error("Error fetching position:", error);
                console.error("Error fetching position:", error);
            }
        },

        onAddObjective(oEvent) {
            const oModel = this.getView().getModel("MboDetails");
            let aData = oModel.getData();
            if (!Array.isArray(aData)) {
                aData = [];
            }

            const oNewItem = {
                objective: "",
                mboWeightage: "",
                comments: "",
                mboScore: ""
            };

            aData.push(oNewItem);
            oModel.setData(aData);
            if (typeof oModel.refresh === "function") {
                oModel.refresh(true);
            }
        },

        onDeleteObjective(oEvent) {
            BusyIndicator.show();
            const selectedEntry = Number(oEvent.getParameter("listItem").getBindingContext('MboDetails').sPath.split('/')[1]);
            const oModel = this.getView().getModel("MboDetails");
            let aData = oModel.getData();
            aData.splice(selectedEntry, 1);
            oModel.setData(aData);
            if (typeof oModel.refresh === "function") {
                oModel.refresh(true);
                BusyIndicator.hide();
            }
        }
    });
});