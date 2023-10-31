const mqtt = require('mqtt');

const wifiScanner = require('node-wifi');



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
            console.log(`Connecting to mqtt server ${this.mqttHost}...`);
            await this._delay(1000);
            
        }

       
    }

    async start() {
        console.log('Start scanning...');
        while (true) {  
            console.log('Start scan interation...');  
            wifiScanner.init({
                iface: null
            });     
            wifiScanner.scan( async (err, networks) => {             
                if (err) {
                    console.error(err);                    
                }
                else {
                    if(networks) {
                        console.log('Found networks:');
                        console.log(networks);
                    
                        console.log('Publish networks');
                        networks.forEach((network) => this._publishNetwork(network));
                    } else {
                        console.log('No networks found...');
                    }
                }                
            });
            console.log('Sleep.....');
            
            await this._delay(this.seconds * 1000);
        }
    }

    async _publishNetwork(network) {      
        // Disco topic
        const discoTopic = `${this.mqttPrefix}/device_tracker/wifianalyzermqtt`; 
        // Data topic
        const dataTopic = `wifianalyzermqtt`; 
        
        // Define the JSON payload for Autodiscovery
        const autodiscoveryPayload = {
            name: `WifiAnalyzerMQTT-${network.mac}`,
            uniq_id: `wifi-analyzer-mqtt-${network.mac}`,  
            json_attributes_topic: `${dataTopic}/${this.removeColonsFromMacAddress(network.mac)}/attributes`,  
            source_type: 'router',
            icon: 'mdi:wifi',
        };
        console.log(`Publish discovery topic for ${discoTopic}/${this.removeColonsFromMacAddress(network.mac)}/config `);                          
        await this._client.publish(`${discoTopic}/${this.removeColonsFromMacAddress(network.mac)}/config`,JSON.stringify(autodiscoveryPayload), { qos: 0, retain: true}, (err)=> {
        if (err) {
            console.error('Error publishing Autodiscovery message:', err);
            } else {
            console.log('Autodiscovery message published successfully');
            }
        }) ;
        
        console.log(`Publish attributes topic for ${dataTopic}/${this.removeColonsFromMacAddress(network.mac)}/attributes`);      
        await this._client.publish( `${dataTopic}/${this.removeColonsFromMacAddress(network.mac)}/attributes`, JSON.stringify(network), { qos: 0, retain: true}, (err)=> {
            if (err) {
                console.error('Error publishing network message:', err);
            } else {
                console.log('Network message published successfully');
            }
        });
    }

    removeColonsFromMacAddress(macAddress) {
        // Use a regular expression to match and remove colons from the MAC address
        return macAddress.replace(/:/g, '');
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