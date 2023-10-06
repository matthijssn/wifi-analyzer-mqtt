const WifiAnalysisToMqtt = require('./src/WifiAnalysisToMqtt');

const mqttTopic = process.env.mqttTopic //'homeassistant/wifi-analyzer'
const mqttHost =  process.env.mqttHost //'eg. mqtt://broker.hivemq.com'
const mqttOptions = {
    username: process.env.mqttUserName,
    password : process.env.mqttPassword
};

const seconds = process.env.seconds;

async function start() {
    let wm = new WifiAnalysisToMqtt(mqttHost, mqttTopic, mqttOptions, seconds);

    await wm.connect();

    await wm.start();
}

start();