sap.ui.define(
  [
    'restaurant00045/controller/BaseController',
    'restaurant00045/utils/State',
    'restaurant00045/utils/Time',
    'restaurant00045/utils/Restaurant',
  ],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   */
  (
    BaseController,
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
            Date: undefined,
            Time: undefined,
            Guests: 1,
            Notes: '',
          },
        },
        computed: {
          canSubmit({ formMutation, form }) {
            const isFormValid = !!form.Email && !!form.Date && !!form.Time && !!form.Guests > 0;
            return !formMutation.isPending && isFormValid;
          },
        },
        methods: {
          async submit(odataModel) {
            const { form, timeOptions } = get();
            const time = timeOptions.find((x) => x.text === form.Time);
            const startsAt = new Date(form.Date.getTime() + time.hour * 60 * 60 * 1000 + time.minute * 60 * 1000);
            const endsAt = addHours(startsAt, 2);
            this.formMutation.mutate(odataModel, '/ReservationSet', {
              Email: form.Email,
              Guests: form.Guests,
              StartsAt: startsAt,
              EndsAt: endsAt,
              Notes: form.Notes,
            });
          },
        },
      }));
    }

    class BookController extends BaseController {
      onInit() {
        this.state = createControllerState();
        this.state.connect(this);
      }

      onSubmit() {
        this.state.submit(this.svc);
      }
    }

    return BookController;
  },
);
