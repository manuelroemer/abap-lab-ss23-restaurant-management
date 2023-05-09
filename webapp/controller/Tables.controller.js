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
        methods: {
          setAdd(value = defaultTable) {
            set({ add: value });
          },
          setEdit(value = defaultTable) {
            set({ edit: value });
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
            this.state.setEdit(data);
            this.goToDetails('edit');
          },
        });
      }

      onAddPress() {
        this.state.setAdd();
        this.goToDetails('add');
      }

      onAddSubmit() {
        const entity = this.state.get().add;
        this.svc.create('/TableSet', entity, {
          success: () => {
            this.goToDetails('placeholder');
            this.state.setAdd();
          },
          error: () => console.error('Creating table failed: ', e),
        });
      }

      onEditSubmit() {
        const entity = this.state.get().edit;
        this.svc.update(this.currentTablePath, entity, {
          success: () => {
            this.goToDetails('placeholder');
            this.state.setEdit();
          },
          error: () => console.error('Updating table failed: ', e),
        });
      }

      onDeletePress() {
        this.svc.remove(this.currentTablePath, {
          success: () => this.goToDetails('placeholder'),
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
