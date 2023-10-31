if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }

const WifiAnalysisToMqtt = require('./src/WifiAnalysisToMqtt');

const mqttPrefix = process.env.mqttPrefix //'homeassistant'
const mqttHost =  process.env.mqttHost //'eg. mqtt://broker.hivemq.com'
const mqttOptions = {
    username: process.env.mqttUserName,
    password : process.env.mqttPassword
};

const seconds = process.env.seconds;

async function start() {
    let wm = new WifiAnalysisToMqtt(mqttHost, mqttPrefix, mqttOptions, seconds);

    await wm.connect();

    await wm.start();
}

start();