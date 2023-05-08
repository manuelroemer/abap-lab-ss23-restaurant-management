sap.ui.define(
  ['restaurant00045/controller/BaseController', 'restaurant00045/utils/Events'],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   * @param {typeof restaurant00045.utils.Events}
   */
  (BaseController, { bindingPathFromEvent }) => {
    const defaultTable = {
      Seats: 1,
      Description: '',
      Location: '',
      Decoration: '',
    };

    class TablesController extends BaseController {
      onInit() {
        this.setupState({
          state: {
            add: defaultTable,
            edit: defaultTable,
          },
          computed: {
            canSubmitAdd({ add }) {
              return !!add.Seats && !!add.Description && !!add.Location && !!add.Decoration;
            },
            canSubmitEdit({ edit }) {
              return !!edit.Seats && !!edit.Description && !!edit.Location && !!edit.Decoration;
            },
          },
        });
      }

      onTablePress(e) {
        this.currentTablePath = bindingPathFromEvent(e, 'svc');
        this.svc.read(this.currentTablePath, {
          success: (data) => {
            this.state.set((s) => ({ ...s, edit: data }));
            this.goToDetails('edit');
          },
        });
      }

      onAddPress() {
        this.goToDetails('add');
      }

      onAddSubmit() {
        const entity = this.state.get().add;
        this.svc.create('/TableSet', entity, {
          success: () => {
            this.goToDetails('placeholder');
            this.state.set((s) => ({
              ...s,
              add: defaultTable,
            }));
          },
          error: () => {
            console.error('Creating table failed: ', e);
          },
        });
      }

      onEditSubmit() {
        const entity = this.state.get().edit;
        this.svc.update(this.currentTablePath, entity, {
          success: () => {
            this.goToDetails('placeholder');
            this.state.set((s) => ({
              ...s,
              edit: defaultTable,
            }));
          },
          error: () => {
            console.error('Updating table failed: ', e);
          },
        });
      }

      onDeletePress() {
        this.svc.remove(this.currentTablePath, {
          success: () => {
            this.goToDetails('placeholder');
          },
          error: () => {
            console.error('Deleting table failed: ', e);
          },
        });
      }

      goToDetails(id) {
        const splitter = this.byId('splitContainer');
        splitter.to(this.createId(id));
      }
    }

    return TablesController;
  },
);
