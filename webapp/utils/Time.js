sap.ui.define([], () => {
  function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  function addHours(to, hours) {
    return new Date(to.getTime() + hours * 60 * 60 * 1000);
  }

  function getEpoch(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  return { getTomorrow, addHours, getEpoch };
});
