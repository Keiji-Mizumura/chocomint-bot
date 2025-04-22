const isoCountries = require('./ISO_countries.json')

const getCountryName = (countryCode) => {
    if (isoCountries.hasOwnProperty(countryCode)) {
        return isoCountries[countryCode];
    } else {
        return countryCode;
    }
}

module.exports = { getCountryName };