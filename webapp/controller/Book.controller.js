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
    { create, createODataCreateMutation },
    { getTomorrow, addHours },
    { getReservationTimeSelectOptions },
  ) => {
    function createControllerState() {
      return create(createODataCreateMutation({ key: 'formMutation' }), ({ get }) => ({
        data: {
          minDate: getTomorrow(),
          timeOptions: [{ text: '' }, ...getReservationTimeSelectOptions()],
          form: {
            Email: '',
            Guests: 1,
            Date: undefined,
            Time: undefined,
            Table: undefined,
            Notes: '',
          },
        },
        computed: {
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
          canSubmit({ formMutation, form }) {
            const isFormValid = !!form.Table && !!form.Email && !!form.Date && !!form.Time && !!form.Guests > 0;
            return !formMutation.isPending && isFormValid;
          },
        },
        methods: {
          async submit(odataModel) {
            const { form, timeWindow } = get();
            this.formMutation.mutate(odataModel, '/ReservationSet', {
              Email: form.Email,
              Guests: form.Guests,
              StartsAt: timeWindow.startsAt,
              EndsAt: timeWindow.endsAt,
              Notes: form.Notes,
              TableId: form.Table,
            });
          },
        },
      }));
    }

    class BookController extends BaseController {
      onInit() {
        this.state = createControllerState();
        this.state.connect(this);

        // Whenever the form (the state) changes, we want to update the tables that are displayed in the form.
        // Only those tables that are free at the selected time window should be shown.
        // The backend takes care of the querying, but we must update the binding to tell the backend the
        // current time window and number of seats.
        this.disposeStateSubscription = this.state.subscribe(({ get }) => {
          const tablesSelect = this.byId('tablesSelect');
          const {
            timeWindow: { startsAt, endsAt },
            form,
          } = get();

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
        });
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
