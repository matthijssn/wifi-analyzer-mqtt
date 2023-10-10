# WiFi Analyzer MQTT Docker Node.js Process

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/matthijssn/wifi-analyzer-mqtt.git)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/matthijssn/wifi-analyzer-mqtt/main)

[![DockerHub](https://img.shields.io/badge/DockerHub-Repository-blue.svg)](https://hub.docker.com/r/matthijssn/wifi-analyzer-mqtt)
![Docker Image Version (latest semver)](https://img.shields.io/docker/v/matthijssn/wifi-analyzer-mqtt)



## Overview

The WiFi Analyzer MQTT Docker Node.js Process is a containerized application that retrieves WiFi information from the host device on a specified frequency and publishes this information to an MQTT broker. It accepts several parameters to configure its behavior, such as the sampling interval, MQTT broker settings, and authentication credentials.

## How it Works

The process collects WiFi information (e.g., signal strength, SSID, BSSID) from the host machine at regular intervals and sends this data to an MQTT broker. The user can customize the following parameters:

- `seconds`: The frequency at which WiFi information is collected and published.
- `mqttHost`: The hostname or IP address of the MQTT broker.
- `mqttTopic`: The MQTT topic to which the data will be published.
- `mqttUserName`: Username for authenticating with the MQTT broker (optional).
- `mqttPassword`: Password for authenticating with the MQTT broker (optional).

## Usage

To use this Dockerized Node.js process, follow these steps:

1. Clone the GitHub repository:
   ```sh
   git clone https://github.com/matthijssn/wifi-analyzer-mqtt.git

2. Navigate to the project directory:
   ```sh
   cd wifi-analyzer-mqtt

3. Build the Docker image:
   ```sh
   docker build -t wifi-analuzer-mqtt .

4. Run the Docker container, passing the required paramters as environment variables
   ```sh
   docker run -e seconds=<sampling_interval> \
           -e mqttHost=<mqtt_broker_host> \
           -e mqttTopic=<mqtt_topic> \
           -e mqttUserName=<mqtt_username> \
           -e mqttPassword=<mqtt_password> \
           wifi-analyzer-mqtt    
    ```           
   Replace <sampling_interval>, <mqtt_broker_host>, <mqtt_topic>, <mqtt_username>, and <mqtt_password> with your desired values.



# Example
Here's an example of how to run the WiFi Analyzer MQTT Docker Node.js Process:

```sh
docker run -e seconds=60 \
           -e mqttHost=mqtt.example.com \
           -e mqttTopic=wifi-data \
           -e mqttUserName=myusername \
           -e mqttPassword=mypassword \
           wifi-analyzer-mqtt
```           
This command will collect WiFi information from the host every 60 seconds and publish it to the MQTT broker at mqtt.example.com under the topic wifi-data using the provided username and password.


# Contributing
If you'd like to contribute to this project, please refer to the GitHub repository for more information on how to get involved.

# License
This project is licensed under the MIT License - see the LICENSE file for details.