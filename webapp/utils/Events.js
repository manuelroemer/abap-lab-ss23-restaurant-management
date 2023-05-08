sap.ui.define([], () => {
  function bindingPathFromEvent(e, modelName) {
    const item = e.getSource();
    if (!item) {
      console.warn('No item could be retrieved from the event source.', e);
      return undefined;
    }

    const bindingContext = item.getBindingContext(modelName);
    if (!bindingContext) {
      console.warn(`No binding context could be retrieved from the item. modelName: ${modelName}`, e, item);
      return undefined;
    }

    const path = bindingContext.getPath();
    if (!path) {
      console.warn('A binding existed, but no path could be retrieved.', bindingContext);
      return undefined;
    }

    return path;
  }

  return { bindingPathFromEvent };
});
