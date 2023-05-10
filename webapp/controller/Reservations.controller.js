sap.ui.define(
  ['restaurant00045/controller/BaseController', 'restaurant00045/utils/Events', 'restaurant00045/utils/State'],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   * @param {typeof restaurant00045.utils.Events}
   */
  (BaseController, { bindingPathFromEvent }) => {
    class ReservationsController extends BaseController {
      onReservationPress(e) {
        this.currentReservationPath = bindingPathFromEvent(e, 'svc');
        this.byId('details').bindElement({
          path: this.currentReservationPath,
          model: 'svc',
          parameters: {
            expand: 'ReservationToTable',
          },
        });
        this.goToDetails('details');
      }

      onDeletePress() {
        this.svc.remove(this.currentReservationPath, {
          success: () => this.goToDetails('placeholder'),
          error: () => console.error('Deleting reservation failed: ', e),
        });
      }

      goToDetails(id) {
        const splitter = this.byId('splitContainer');
        splitter.to(this.createId(id));
      }
    }

    return ReservationsController;
  },
);
