sap.ui.define(
  ['restaurant00045/controller/BaseController', 'sap/m/MessageBox'],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   */
  (BaseController, MessageBox) => {
    class MainController extends BaseController {
      onBookPress() {
        this.router.navTo('Book');
      }

      onAdminPress() {
        this.router.navTo('Admin');
      }

      onBookEditPress() {
        const dialog = this.byId('bookEditDialog');
        dialog.open();
      }

      onBookEditDialogSubmit() {
        const reservationId = this.byId('bookEditDialogReservationId').getValue();
        if (!reservationId) {
          return;
        }

        if (reservationId) {
          this.svc.read(`/ReservationSet('${reservationId}')`, {
            success: () => {
              this.byId('bookEditDialogReservationId').setValue('');
              this.byId('bookEditDialog').close();
              this.router.navTo('Book', { reservationId });
            },
            error: () => {
              MessageBox.warning('Sorry, we could not find a reservation with that ID. Please verify that it exists and then try again. Hint: You can see all IDs in the Administration overview.');
            },
          });
        }
      }

      onBookEditDialogCancel() {
        this.byId('bookEditDialogReservationId').setValue('');
        this.byId('bookEditDialog').close();
      }
    }

    return MainController;
  },
);
