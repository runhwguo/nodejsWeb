const getRandomInt = (min = 0, max = 9) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getToday = (isFormatTwoNum = true, connector = '-') => {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();
  if (isFormatTwoNum) {
    if (dd < 10) {
      dd = '0' + dd
    }

    if (mm < 10) {
      mm = '0' + mm
    }
  }

  today = yyyy + connector + mm + connector + dd;
  return today;
};

export {
  getRandomInt, getToday
};