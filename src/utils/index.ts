const convertHourToMinutes = (time: String) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export { convertHourToMinutes };
