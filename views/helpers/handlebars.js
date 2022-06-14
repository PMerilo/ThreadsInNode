const moment = require('moment');

const formatDate = function(date, targetFormat){
    return moment(date).format(targetFormat);
}

module.exports = { formatDate};