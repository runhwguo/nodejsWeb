module.exports = (...rest) =>{
    let sum = 0;
    for (let n of rest) {
        sum += n;
    }
    return sum;
};