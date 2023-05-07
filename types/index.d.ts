// Contains TS type declarations that mirror the JS setup.
// This greatly assists VS Code's IntelliSense.

declare namespace restaurant00045 {
  namespace controller {
    class BaseController {
      get router(): sap.ui.core.routing.Router;
      goBack(): void;
    }
  }
}
