// Contains TS type declarations that mirror the JS setup.
// This greatly assists VS Code's IntelliSense.

declare namespace restaurant00045 {
  namespace controller {
    class BaseController extends sap.ui.core.mvc.Controller {
      state: utils.State;
      get router(): sap.ui.core.routing.Router;
      get svc(): sap.ui.model.odata.v2.ODataModel;
      setupState(stateInit?: utils.StateInit);
      goBack(): void;
    }
  }

  namespace utils {
    interface StateInit<T = any> {
      state?: T;
      computed?: Record<string, (state: T) => any>;
    }

    class State<T = any> {
      constructor(init?: StateInit<T>);
      get(): T;
      set(state: T | ((state: T) => T)): void;
    }


    interface Events {
      bindingPathFromEvent(e: sap.ui.base.Event, modeName: string): string;
    }
  }
}
