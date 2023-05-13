sap.ui.define(
  [
    'restaurant00045/controller/BaseController',
    'sap/ui/model/Filter',
    'restaurant00045/utils/State',
    'restaurant00045/utils/Time',
    'restaurant00045/utils/Restaurant',
  ],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   */
  (
    BaseController,
    Filter,
    { create, createMutation },
    { getTomorrow, addHours, getEpoch },
    { getReservationTimeSelectOptions },
  ) => {
    function createControllerState() {
      return create(
        // Mutation that submits OR creates a new reservation, depending on whether we're in edit mode
        // (edit mode === presence of an Id that's not falsy).
        createMutation({
          key: 'submitMutation',
          mutate(odataModel, path, entity) {
            return new Promise((res, rej) =>
              entity.Id
                ? odataModel.update(`${path}('${entity.Id}')`, entity, { success: res, error: rej })
                : odataModel.create(path, entity, { success: res, error: rej }),
            );
          },
        }),
        ({ get }) => ({
          data: {
            minDate: getTomorrow(),
            timeOptions: [{ text: '' }, ...getReservationTimeSelectOptions()],
            form: {
              Id: undefined,
              Email: '',
              Guests: 1,
              Date: undefined,
              Time: undefined,
              Table: undefined,
              Notes: '',
            },
          },
          computed: {
            isEditing({ form}) {
              return !!form.Id;
            },
            timeWindow({ form, timeOptions }) {
              const date = form.Date;
              const time = timeOptions.find((x) => x.text === form.Time);

              if (!date || !time) {
                return { startsAt: undefined, endsAt: undefined };
              }

              const startsAt = new Date(date.getTime() + time.hour * 60 * 60 * 1000 + time.minute * 60 * 1000);
              const endsAt = addHours(startsAt, 2);
              return { startsAt, endsAt };
            },
            canSubmit({ submitMutation, form }) {
              const isFormValid = !!form.Table && !!form.Email && !!form.Date && !!form.Time && !!form.Guests > 0;
              return !submitMutation.isPending && isFormValid;
            },
          },
          methods: {
            async submit(odataModel) {
              const { form, timeWindow } = get();
              this.submitMutation.mutate(odataModel, '/ReservationSet', {
                Id: form.Id,
                Email: form.Email,
                Guests: form.Guests,
                StartsAt: timeWindow.startsAt,
                EndsAt: timeWindow.endsAt,
                Notes: form.Notes,
                TableId: form.Table,
              });
            },
          },
        }),
      );
    }

    class BookController extends BaseController {
      onInit() {
        this.state = createControllerState();
        this.state.connect(this);
        this.router.attachRoutePatternMatched(() => this.state.reset());

        // Whenever the form (the state) changes, we want to update the tables that are displayed in the form.
        // Only those tables that are free at the selected time window should be shown.
        // The backend takes care of the querying, but we must update the binding to tell the backend the
        // current time window and number of seats.
        this.disposeStateSubscription = this.state.subscribe(() => this.rebindTablesSelect());

        // For editing:
        // The reservation ID to be updated comes from the URL params.
        // Simply fetch the current state and populate the form with it.
        this.router.getRoute('Book').attachPatternMatched((e) => {
          const reservationId = e.getParameters()?.arguments?.reservationId;

          if (reservationId) {
            this.svc.read(`/ReservationSet('${reservationId}')`, {
              success: (data) => {
                this.state.set({
                  form: {
                    Id: data.Id,
                    Email: data.Email,
                    Guests: data.Guests,
                    Date: getEpoch(data.StartsAt),
                    Time: this.state
                      .get()
                      .timeOptions.find(
                        (x) => x.hour === data.StartsAt.getHours() && x.minute == data.StartsAt.getMinutes(),
                      )?.text,
                    Table: data.TableId,
                    Notes: data.Notes,
                  },
                });
                this.rebindTablesSelect();
              },
            });
          }
        });
      }

      /** Sets the binding path of the tables select to the endpoint which lists all available tables for the current time frame. */
      rebindTablesSelect() {
        const tablesSelect = this.byId('tablesSelect');
        const {
          timeWindow: { startsAt, endsAt },
          form,
        } = this.state.get();

        if (startsAt && endsAt) {
          tablesSelect.bindItems({
            path: '/TableSet',
            model: 'svc',
            template: new sap.ui.core.Item({
              key: '{svc>Id}',
              text: "{= ${svc>Description} || '-'} / {= ${svc>Location} || '-'} / {= ${svc>Decoration} || '-'} / {= ${svc>Seats} || '-'} {i18n>bookFormSeats}",
            }),
            filters: [
              new Filter({
                path: 'Seats',
                operator: 'GE',
                value1: form.Guests,
              }),
            ],
            parameters: {
              custom: {
                freeAtStart: startsAt.toISOString(),
                freeAtEnd: endsAt.toISOString(),
              },
            },
          });
        } else {
          tablesSelect.unbindItems();
        }
      }

      onExit() {
        this.disposeStateSubscription();
      }

      onSubmit() {
        this.state.submit(this.svc);
      }
    }

    return BookController;
  },
);
