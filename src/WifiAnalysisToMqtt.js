const mqtt = require('mqtt');
const scanner = require('node-wifi-scanner');

const topic = `${this.mqttPrefix}/device_tracker/wifianalyzermqtt`; 




class WifiAnalysisToMqtt {

    constructor(mqttHost, mqttPrefix, mqttOptions, seconds) {
        this.mqttHost = mqttHost;
        this.mqttPrefix = mqttPrefix;
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
        console.log('Start scanning...');
        while (true) {
            scanner.scan(async (err, networks) => {
                if (err) {
                    console.error(err);
                    return;
                }

                if(networks) {
                    console.log('Found networks:');
                    console.log(networks);
                    
                    console.log('Publish networks');
                    networks.forEach(_publishNetwork);
                } else {
                    console.log('No networks found...');
                }

                console.log('Sleep.....');
                await this._delay(this.seconds * 1000);
            });
        }
    }

    async _publishNetwork(network) {      
        // Define the JSON payload for Autodiscovery
        const autodiscoveryPayload = {
            name: 'WifiAnalyzerMQTT',
            uniq_id: 'wifi-analyzer-mqtt',  
            json_attributes_topic: `${network.mac}/attributes`,  
            icon: 'mdi:wifi',
        };
        console.log(`Publish discovery topic for ${network.mac} `);                          
        await this._client.publish(this.topic + `${network.mac}/config`,JSON.stringify(this.autodiscoveryPayload, { qos: 0, retain: true}, (err)=> {
        if (err) {
            console.error('Error publishing Autodiscovery message:', err);
            } else {
            console.log('Autodiscovery message published successfully');
            }
        }) );
        
        console.log(`Publish attributes topic for ${network.mac} `);      
        await this._client.publish(this.topic + `${network.mac}/attributes`, JSON.stringify(network), { qos: 1, retain: false}, (err)=> {
            if (err) {
                console.error('Error publishing network message:', err);
            } else {
                console.log('Network message published successfully');
            }
        });
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