sap.ui.define(
  ['restaurant00045/controller/BaseController'],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   */
  (BaseController) => {
    class MainController extends BaseController {
      onBookPress() {
        this.router.navTo('Book');
      }

      onAdminPress() {
        this.router.navTo('Admin');
      }
    }

    return MainController;
  },
);
