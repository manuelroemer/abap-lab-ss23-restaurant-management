sap.ui.define(
  ['sap/ui/core/UIComponent', 'sap/ui/Device', 'sap/ui/model/json/JSONModel'],
  /**
   *
   * @param {typeof sap.ui.core.UIComponent} UIComponent
   * @param {typeof sap.ui.Device} Device
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   */
  (UIComponent, Device, JSONModel) => {
    return UIComponent.extend('restaurant00045.Component', {
      metadata: {
        manifest: 'json',
      },

      init(...args) {
        // UIComponent.prototype.init.apply(this, args);
        super.init(args);
        this.getRouter().initialize();
        this.setModel(new JSONModel(Device), 'device');
      },
    });
  },
);
