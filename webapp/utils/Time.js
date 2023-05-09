sap.ui.define([], () => {
  function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  function addHours(to, hours) {
    return new Date(to.getTime() + hours * 60 * 60 * 1000);
  }

  return { getTomorrow, addHours };
});
