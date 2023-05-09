sap.ui.define([], () => {
  function getReservationTimeSelectOptions() {
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
  }

  return { getReservationTimeSelectOptions };
});
