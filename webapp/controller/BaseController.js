sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/core/UIComponent', 'sap/ui/core/routing/History'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   * @param {typeof sap.ui.core.UIComponent} UIComponent
   * @param {typeof sap.ui.core.routing.History} History
   */
  (Controller, UIComponent, History) => {
    class BaseController extends Controller {
      get router() {
        return UIComponent.getRouterFor(this);
      }

      get svc() {
        return this.getView().getModel('svc');
      }

      goBack() {
        const history = History.getInstance();
        const previousHash = history.getPreviousHash();

        if (previousHash) {
          window.history.go(-1);
        } else {
          this.router.navTo('Main', undefined, undefined, true);
        }
      }
    }

    return BaseController;
  },
);
