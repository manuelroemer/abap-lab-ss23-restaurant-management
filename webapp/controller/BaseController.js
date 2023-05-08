sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/ui/core/UIComponent', 'sap/ui/core/routing/History', 'restaurant00045/utils/State'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   * @param {typeof sap.ui.core.UIComponent} UIComponent
   * @param {typeof sap.ui.core.routing.History} History
   * @param {typeof restaurant00045.utils.State} State
   */
  (Controller, UIComponent, History, State) => {
    class BaseController extends Controller {
      get router() {
        return UIComponent.getRouterFor(this);
      }

      get svc() {
        return this.getView().getModel('svc');
      }

      setupState(stateInit) {
        this.state = new State(stateInit);
        this.getView().setModel(this.state.model);
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
