sap.ui.define(
  ['sap/ui/model/json/JSONModel', 'sap/base/util/merge', 'sap/base/util/deepClone'],
  /**
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.base.util.merge} merge
   * @param {typeof sap.base.util.deepClone} deepClone
   */
  (JSONModel, merge, deepClone) => {
    /**
     * A simple state management implementation based on SAPUI5's JSONModel.
     * The shape is inspired by Vue - a state has data, computed functions and methods.
     * State can be initialized by multiple initializers to allow for modularization.
     *
     * ## Example:
     * ```js
     * const myState = create({
     *   data: { count: 0 },
     *   computed: { doubleCount({ count}) { return count * 2; }},
     *   methods: { printCount: ({ get }) => console.log(get().doubleCount), },
     * });
     *
     * myState.set({ count: 1 });
     * myState.printCount(); // 2
     * ```
     * @param  {...any} stateInitializers Initializer functions which define the state's shape.
     */
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
        const listener = () => cb(state);
        model.attachPropertyChange(null, listener);
        return () => model.detachPropertyChange(listener);
      };

      const connect = (controller, modelName) => {
        controller.getView().setModel(model, modelName);
      };

      const reset = () => set(deepClone(initialData), true);

      const inits = stateInitializers.map((initializer) => initializer({ get, set }));
      const initialData = merge({}, ...inits.map((i) => i.data));
      const methods = merge({}, ...inits.map((i) => i.methods));
      const computations = merge({}, ...inits.map((i) => i.computed));

      // Set the initial data that was handed by the initializers.
      reset();

      // The JSONModel primarily uses two-way binding.
      // We must react to outside changes in the model to update computed values.
      // The model is smart enough to only notify when an actual change occurred, meaning
      // that we won't run into a loop here.
      subscribe(({ get, set }) => set(get(), true));

      const state = {
        model,
        get,
        set,
        reset,
        subscribe,
        connect,
        ...methods,
      };

      // Bind the state's method to the state itself.
      // This allows accessing the state via 'this' in its methods.
      for (const key in methods) {
        if (typeof methods[key] === 'function') {
          methods[key] = methods[key].bind(state);
        }
      }

      return state;
    }

    /**
     * Sets the `value` as an attribute on the `object` at the given dot-separated path (e.g., `foo.bar.baz`).
     */
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

    /**
     * Creates a state initializer which introduces state for an asynchronous data mutation.
     * This is modeled after popular libraries like "swr" or "react-query".
     * Even though this is React specific, the following links may provide some context on what mutations are:
     * - https://tanstack.com/query/latest/docs/react/guides/mutations
     * - https://swr.vercel.app/docs/mutation#useswrmutation
     *
     * This function expects one object parameter which provides the following arguments:
     * - `key`: The key/name under which the mutation state properties will be added to the state object.
     * - `mutate`: The function that runs the actual asynchronous data mutation.
     * - `onSuccess`: An optional callback that is invoked when the mutation succeeds.
     * - `onError`: An optional callback that is invoked when the mutation fails.
     *
     * The state initializer will introduce the following state, where `key` is a custom key
     * provided as an argument:
     * - `key`:
     *   - `data`: The data returned by the mutation function when it succeeds.
     *   - `error`: An error thrown when the mutation function fails.
     *   - `status`: The status of the mutation. Can be one of "idle", "pending", "success" or "error".
     *   - `isIdle`: true if `status` is "idle".
     *   - `isPending`: true if `status` is "pending".
     *   - `isSuccess`: true if `status` is "success".
     *   - `isError`: true if `status` is "error".
     *
     * Additionally, the following methods are introduced on the state object:
     * - `key`:
     *   - `mutate`: Asynchronously invokes the mutation.
     *
     * ## Example:
     * ```js
     * const myState = create(
     *   createMutation({
     *     key: 'myMutation',
     *     mutate: async (someDelayParameter = 1000) => {
     *       await delay(someDelayParameter);
     *       return 'some value';
     *     },
     *   })
     * );
     *
     * console.log(myState.get().myMutation); // { data: undefined, error: undefined, status: 'idle' }
     * await myState.mutate(2000);
     * console.log(myState.get().myMutation); // { data: 'some value', error: undefined, status: 'success' }
     * ```
     */
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

    return { create, createMutation };
  },
);
