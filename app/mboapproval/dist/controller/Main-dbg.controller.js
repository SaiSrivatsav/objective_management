sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, BusyIndicator, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("mboapproval.controller.Main", {
        onInit() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteMain").attachPatternMatched(this._onObjectMatched, this);
        },
        async _onObjectMatched() {
            this._i18nModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this.getOwnerComponent().getModel("CaseList").setData([]);
            this.getOwnerComponent().getModel("MboDetails").setData([]);
            this.getOwnerComponent().getModel("CaseComments").setData([]);
            this.getOwnerComponent().getModel("CaseDocuments").setData([]);
            BusyIndicator.show();
            await this.getAllCases();
            BusyIndicator.hide();
        },

        async getAllCases() {
            const sUrl = this.getOwnerComponent().getManifestObject().resolveUri(this.getOwnerComponent().getManifestEntry("sap.app").dataSources.mainService.uri);
            try {
                const response = await fetch(`${sUrl}/getAllCases`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                const data = await response.json();
                this.getOwnerComponent().getModel("CaseList").setData(data.value);
            } catch (error) {
                BusyIndicator.hide();
                console.error("Error fetching all cases:", error);
            }
        },

        onItemPress(oEvent){
            const selectedIndex = parseInt(oEvent.getSource().getBindingContext("CaseList").sPath.split("/")[1]);
            const selectedCase = this.getOwnerComponent().getModel("CaseList").getData()[selectedIndex];
            this.getView().byId("idCaseTitle").setText(selectedCase.caseName);
            this.getView().byId("idCaseTitleSnap").setText(selectedCase.caseName);
            this.getView().byId("idCaseNameText").setText(selectedCase.caseName);
            this.getView().byId("idCaseDescpText").setText(selectedCase.description);
            this.getView().byId("idCreatedByText").setText(selectedCase.submittedBy);
            this.getView().byId("idAssignedToText").setText(selectedCase.assignedTo);
            this.getView().byId("idPriorityText").setText(selectedCase.priority);
            this.getView().byId("idStatusText").setText(selectedCase.status);
            this.getView().getModel("MboDetails").setData(selectedCase.objectives || []);
            this.getView().getModel("MboDetails").refresh();
            this.getView().byId("idDetailInitPage").setVisible(false);
            this.getView().byId("idDetailObjPage").setVisible(true);
        }
    });
});