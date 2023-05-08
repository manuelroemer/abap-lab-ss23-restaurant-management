sap.ui.define(
  ['restaurant00045/controller/BaseController'],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   */
  (BaseController) => {
    class TablesController extends BaseController {
      onAddPress() {
        this.goToDetails('add');
      }

      goToDetails(id) {
        const splitter = this.byId('splitContainer');
        splitter.to(this.createId(id));
      }
    }

    return TablesController;
  },
);
