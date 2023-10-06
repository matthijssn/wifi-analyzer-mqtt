const mqtt = require('mqtt');
const scanner = require('node-wifi-scanner');

class WifiAnalysisToMqtt {

    constructor(mqttHost, mqttTopic, mqttOptions, seconds) {
        this.mqttHost = mqttHost;
        this.mqttTopic = mqttTopic;
        this.mqttOptions = mqttOptions;
        this.seconds = seconds;

        this._client = {};
        this._state = {
            mqttConnected: false
        }
    }

    async connect() {
        await this._setupConnection(this.mqttHost, this.mqttOptions);
        while (!this._state.mqttConnected) {
            console.log('Connecting to mqtt server...');
            await this._delay(1000);
        }
    }

    async start() {
        while (true) {
            scanner.scan(async (err, networks) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(networks);
                await this._client.publish(this.mqttTopic, JSON.stringify(networks));
            });
            

            console.log('Sleep.....');
            await this._delay(this.seconds * 1000);
        }
    }

    async _setupConnection(mqttHost, options = {}) {
        try {
            this._client = await mqtt.connect(mqttHost, options)
            this._client.on('connect', () => this._connectionHandler())
            this._client.on('close', () => this._disconnectionHandler())
            this._client.on('message', (topic, payload) => this._messageHandler(topic, payload))
            this._client.on('error', (error) => this._errorHandler(error))
        } catch (error) {
            console.error(`Error connecting to to ${mqttHost}: ${error}`)
        }
    }

    _connectionHandler () {
        console.info('MQTT Connection established!')  
        this._state.mqttConnected = true
      }

    async _delay(t) {
        return new Promise(function (resolve) {
            setTimeout(resolve, t)
        })
    }

    _errorHandler(error) {
        console.error(`Error: ${error}`)
    }

    _disconnectionHandler () {
        console.info('MQTT Connection lost!')
        for (const topic in this._routingTable) {
          this._unsubscribe(topic)
          this._routingTable.delete(topic)
        }
        this._routingTable = new Map()
      }



}

module.exports = WifiAnalysisToMqtt;