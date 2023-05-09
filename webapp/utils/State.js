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
        for (const [path, compute] of Object.entries(computations)) {
          setObjectPath(nextState, path, compute(nextState));
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

      const state = {
        model,
        get,
        set,
        subscribe,
        connect,
        ...methods,
      };

      // Bind the state's method to the state itself.
      // This allows accessing the state via 'this' in its methods.
      for (const key in state) {
        if (typeof state[key] === 'function') {
          state[key] = state[key].bind(state);
        }
      }

      return state;
    }

    function setObjectPath(object, path, value) {
      const parts = path.split('.');
      let current = object;

      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const currentPart = parts[i];

        if (isLast) {
          current[currentPart] = value;
          break;
        }

        current[currentPart] ??= {};
        current = current[currentPart];
      }
    }

    function createMutation({ key, mutate, onSuccess, onError }) {
      return ({ get, set }) => ({
        data: {
          [key]: {
            data: undefined,
            error: undefined,
            status: 'idle',
            __mutation: undefined,
          },
        },
        computed: {
          [`${key}.isIdle`]: (state) => state[key].status === 'idle',
          [`${key}.isPending`]: (state) => state[key].status === 'pending',
          [`${key}.isSuccess`]: (state) => state[key].status === 'success',
          [`${key}.isError`]: (state) => state[key].status === 'error',
        },
        methods: {
          [key]: {
            async mutate(...args) {
              const state = get()[key];

              // Only allow one mutation at a time.
              if (state.status === 'pending') {
                return state.__mutation;
              }

              try {
                const mutation = mutate(...args);
                set({
                  [key]: {
                    status: 'pending',
                    __mutation: mutation,
                  },
                });

                const data = await mutation;

                set({
                  [key]: {
                    data,
                    status: 'success',
                    __mutation: undefined,
                  },
                });

                onSuccess?.({ data });
              } catch (error) {
                set({
                  [key]: {
                    error,
                    status: 'error',
                    __mutation: undefined,
                  },
                });

                onError?.({ error });
                throw error;
              }
            },
          },
        },
      });
    }

    function createODataCreateMutation({ key }) {
      return createMutation({
        key,
        mutate(odataModel, path, entity) {
          return new Promise((res, rej) =>
            odataModel.create(path, entity, {
              success: res,
              error: rej,
            }),
          );
        },
      });
    }

    return { create, createMutation, createODataCreateMutation };
  },
);
