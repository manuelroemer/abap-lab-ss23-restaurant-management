sap.ui.define(
  ['sap/ui/model/json/JSONModel'],
  /**
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   */
  (JSONModel) => {
    class State {
      constructor({ state = {}, computed = {} } = {}) {
        this.computed = computed;
        this.model = new JSONModel(state);
        this.model.attachPropertyChange(null, () => this.#recomputeAndSet(this.model.getData()));
        this.#recomputeAndSet(state);
      }

      get() {
        return this.model.getProperty('/');
      }

      set(state) {
        const nextState = typeof state === 'function' ? state(this.get()) : state;
        this.#recomputeAndSet(nextState);
      }

      #recomputeAndSet(state) {
        const computed = {};
        for (const [key, compute] of Object.entries(this.computed)) {
          computed[key] = compute(state);
        }

        const previousState = this.get();
        const nextState = {
          ...state,
          ...computed,
        };
        this.model.setProperty('/', nextState);

        console.group('State change');
        console.debug('Previous: ', previousState);
        console.debug('Next: ', nextState);
        console.groupEnd();
      }
    }

    return State;
  },
);
