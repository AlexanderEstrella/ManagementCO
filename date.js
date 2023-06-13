exports.getDate = () => {
  today = new Date().toLocaleDateString("en-US");

  return today;
};

exports.getDay = () => {
  const today = new Date();

  const options = {
    weekday: "long",
  };

  return today.toLocaleDateString("en-US", options);
};
