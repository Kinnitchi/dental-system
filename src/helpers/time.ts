export const generateTimeSlots = () => {
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;
      timeSlots.push(time);
    }
  }
  return timeSlots;
};
