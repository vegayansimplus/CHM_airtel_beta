
export const isFutureDate = (dateToCheck: string | Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison

  const shiftDate = new Date(dateToCheck);
  shiftDate.setHours(0, 0, 0, 0);

  return shiftDate > today;
};