const moment = require('moment');

const formatDate = function(date, targetFormat){
    return moment(date).format(targetFormat);
}


const identifystring = function(s1,s2){
    return s1 == s2;
}

module.exports = { formatDate, identifystring};