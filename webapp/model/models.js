sap.ui.define(
  ['sap/ui/model/BindingMode', 'sap/ui/model/json/JSONModel', 'sap/ui/Device'],
  /**
   * @param {typeof sap.ui.model.BindingMode} BindingMode
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.ui.Device} Device
   */
  (BindingMode, JSONModel, Device) => ({
    createDeviceModel() {
      const model = new JSONModel(Device);
      model.setDefaultBindingMode(BindingMode.OneWay);
      return model;
    },
  }),
);
