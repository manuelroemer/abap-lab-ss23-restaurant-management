sap.ui.define(
  ['sap/ui/model/json/JSONModel', 'sap/base/util/merge'],
  /**
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.base.util.merge} merge
   */
  (JSONModel, merge) => {
    function create(...stateInitializers) {
      const model = new JSONModel({});

      const get = () => {
        return model.getProperty('/');
      };

      const set = (stateUpdate, replace = false) => {
        const currentState = get();

        if (typeof stateUpdate === 'function') {
          stateUpdate = stateUpdate(currentState);
        }

        const nextState = { ...(replace ? stateUpdate : merge(currentState, stateUpdate)) };
        for (const [key, compute] of Object.entries(computations)) {
          nextState[key] = compute(nextState);
        }

        model.setProperty('/', nextState);
        console.group('State change');
        console.info('Previous: ', currentState);
        console.info('Next: ', nextState);
        console.groupEnd();
      };

      const subscribe = (cb) => {
        const listener = () => cb(get, set);
        model.attachPropertyChange(null, listener);
        return () => model.detachPropertyChange(listener);
      };

      const connect = (controller, modelName) => {
        controller.getView().setModel(model, modelName);
      };

      const inits = stateInitializers.map((initializer) => initializer({ get, set }));
      const initialData = merge({}, ...inits.map((i) => i.data));
      const methods = merge({}, ...inits.map((i) => i.methods));
      const computations = merge({}, ...inits.map((i) => i.computed));

      // Set the initial data that was handed by the initializers.
      set(initialData, true);

      // The JSONModel primarily uses two-way binding.
      // We must react to outside changes in the model to update computed values.
      // The model is smart enough to only notify when an actual change occurred, meaning
      // that we won't run into a loop here.
      subscribe((get, set) => set(get(), true));

      return {
        model,
        get,
        set,
        subscribe,
        connect,
        ...methods,
      };
    }

    return { create };
  },
);
