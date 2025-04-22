const green = '\x1b[32m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

const { formattedTime } = require('./current_date');

function console_log(message){
    console.log(`${green}${formattedTime()}${reset} ${message}`);
}

function console_said(message, user){
    // User saying something in chat
    console.log(`${green}${formattedTime()}${reset} ${yellow}${user}${reset} said ${message}`);
}

module.exports = { console_log, console_said }