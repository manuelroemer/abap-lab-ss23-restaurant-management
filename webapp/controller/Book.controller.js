sap.ui.define(
  ['restaurant00045/controller/BaseController', 'restaurant00045/utils/State'],
  /**
   * @param {typeof restaurant00045.controller.BaseController} BaseController
   * @param {typeof restaurant00045.utils.State} State
   */
  (BaseController, { create }) => {
    function createControllerState() {
      /**
       * Generates the options for the time <Select /> control.
       * -> A list of 30 minute intervals from 8:00 to 21:30 (i.e., the opening hours of the restaurant).
       */
      const getTimeOptions = () => {
        const opts = [];

        for (let hour = 8; hour <= 21; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            opts.push({
              hour,
              minute,
              text: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            });
          }
        }

        return opts;
      };

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      return create(({ get, set }) => ({
        data: {
          minDate: tomorrow,
          timeOptions: [{ text: '' }, ...getTimeOptions()],
          form: {
            Email: '',
            Guests: 1,
            Date: undefined,
            Time: undefined,
            Notes: '',
          },
          isSubmitting: false,
          isSuccess: false,
          isError: false,
        },
        computed: {
          canSubmit({ isSubmitting, form }) {
            const isFormValid = !!form.Email && !!form.Date && !!form.Time && !!form.Guests > 0;
            return !isSubmitting && isFormValid;
          },
        },
        methods: {
          submit(svc) {
            const { form, timeOptions } = get();
            const time = timeOptions.find((x) => x.text === form.Time);
            const startsAt = new Date(
              form.Date.getTime() + time.hour * 60 * 60 * 1000 + time.minute * 60 * 1000,
            );
            const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
            const entity = {
              Email: form.Email,
              Guests: form.Guests,
              StartsAt: startsAt,
              EndsAt: endsAt,
              Notes: form.Notes,
            };

            set({ isSubmitting: true });
            svc.create('/ReservationSet', entity, {
              success: () => {
                set({ isSubmitting: false, isSuccess: true, isError: false });
              },
              error: () => {
                set({ isSubmitting: false, isSuccess: false, isError: true });
              },
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
