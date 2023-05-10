sap.ui.define(
  ['restaurant00045/controller/BaseController', 'restaurant00045/utils/Events', 'restaurant00045/utils/State'],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   * @param {typeof restaurant00045.utils.Events}
   * @param {typeof restaurant00045.utils.State}
   */
  (BaseController, { bindingPathFromEvent }, { create }) => {
    function createControllerState() {
      const defaultTable = {
        Seats: 1,
        Description: '',
        Location: '',
        Decoration: '',
      };

      return create(({ set }) => ({
        data: {
          tableToCreate: defaultTable,
          tableToUpdate: defaultTable,
        },
        computed: {
          canCreate({ tableToCreate }) {
            return (
              !!tableToCreate.Seats &&
              !!tableToCreate.Description &&
              !!tableToCreate.Location &&
              !!tableToCreate.Decoration
            );
          },
          canUpdate({ tableToUpdate }) {
            return (
              !!tableToUpdate.Seats &&
              !!tableToUpdate.Description &&
              !!tableToUpdate.Location &&
              !!tableToUpdate.Decoration
            );
          },
        },
        methods: {
          setTableToCreate(value) {
            set({ tableToCreate: value });
          },
          clearTableToCreate() {
            this.setTableToCreate(defaultTable);
          },
          setTableToUpdate(value) {
            set({ tableToUpdate: value });
          },
          clearTableToUpdate() {
            this.setTableToUpdate(defaultTable);
          },
        },
      }));
    }

    class TablesController extends BaseController {
      onInit() {
        this.state = createControllerState();
        this.state.connect(this);
      }

      onTablePress(e) {
        this.currentTablePath = bindingPathFromEvent(e, 'svc');
        this.svc.read(this.currentTablePath, {
          success: (data) => {
            this.state.setTableToUpdate(data);
            this.goToDetails('edit');
          },
        });
      }

      onAddPress() {
        this.goToDetails('add');
      }

      onAddSubmit() {
        const { tableToCreate } = this.state.get();
        this.svc.create('/TableSet', tableToCreate, {
          success: () => {
            this.goToDetails('placeholder');
            this.state.clearTableToCreate();
          },
          error: () => console.error('Creating table failed: ', e),
        });
      }

      onEditSubmit() {
        const { tableToUpdate } = this.state.get();
        this.svc.update(this.currentTablePath, tableToUpdate, {
          success: () => {
            this.goToDetails('placeholder');
            this.state.clearTableToUpdate();
          },
          error: () => console.error('Updating table failed: ', e),
        });
      }

      onDeletePress() {
        this.svc.remove(this.currentTablePath, {
          success: () => {
            this.svc.refresh();
            this.goToDetails('placeholder');
          },
          error: () => console.error('Deleting table failed: ', e),
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
