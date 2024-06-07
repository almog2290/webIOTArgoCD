const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

const sessionLiveData = {movSuccess: 0, movFailed: 0, x: 0, y: 0, Status:0, distance:0};

// Insert data sessionReport into the table
const insertQuery = `
  INSERT INTO sessionReport (trainingDate, trainingTotalTime , distanceVal, movSuccess)
  VALUES (?,?,?,?)
`;

// Replace with your broker's address and port
const brokerUrl = 'mqtt://hairdresser.cloudmqtt.com'; // Example broker URL
const options = {
  
  clientId: 'team10NodeServerMiniPcAlmog', // Choose a unique client ID
  username: 'weftpnrz', // If your broker requires authentication
  password: 'c-bBNA60FjH2', // If your broker requires authentication
  port: 15697,      // Set the port of the MQTT broker you wish to connect to
  keepalive: 300,  // Seconds, set to 0 to disable
};

const client = mqtt.connect(brokerUrl, options);
client.subscribe('braude/teams/team10/sessionReport');
client.subscribe('braude/teams/team10/sessionLive');
console.log('Connected to MQTT broker');
console.log('Client ID: ', options.clientId);
console.log('Subscribed to topic: braude/teams/team10/sessionReport');
console.log('Subscribed to topic: braude/teams/team10/sessionLive');


client.on('message', (topic, message) => {
  
  const db = new sqlite3.Database('./database/database.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

  console.log(`Received message on topic "${topic}": ${message.toString()}`);

  if(topic == 'braude/teams/team10/sessionReport'){
    const messageJson = JSON.parse(message.toString());

    // Create a Date object for the trainingTotalTime
    const trainingTotalTime = new Date() // Current date and time
    trainingTotalTime.setSeconds(messageJson.timeStampSecond); // Set the seconds
    trainingTotalTime.setMinutes(messageJson.timeStampMinute); // Set the minutes
    trainingTotalTime.setHours(0); // Set the hours
    const LocaleTimeTrainingTotalTime = trainingTotalTime.toLocaleTimeString();
  
    //Create a Date object for trainigDate 
    const trainingDate = new Date();
    console.log("trainigTotalTime: " + LocaleTimeTrainingTotalTime);
    console.log("trainigDate: " + trainingDate.toISOString());
  
    // Insert a row into the database of the received message
    db.run(insertQuery,[trainingDate.toISOString(),LocaleTimeTrainingTotalTime, messageJson.distanceVal, messageJson.movSuccess], (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Row(s) updated');
      // Close the database connection
      db.close();
    });
  }
  else if(topic == 'braude/teams/team10/sessionLive'){
    const messageJson = JSON.parse(message.toString());
    sessionLiveData.movSuccess = messageJson.movSuccess;
    sessionLiveData.movFailed = messageJson.movFailed;
    sessionLiveData.x = messageJson.x;
    sessionLiveData.y = messageJson.y;
    sessionLiveData.Status = messageJson.Status;
    sessionLiveData.prevStatus = messageJson.prevStatus;
    sessionLiveData.distance = messageJson.distance;
    console.log("sessionLiveData: " + JSON.stringify(sessionLiveData));
  }
  else 
  {
    console.log("topic not relevant..!!")
  }

});

sessionLiveClear = () => {
  sessionLiveData.movSuccess = 0;
  sessionLiveData.movFailed = 0;
  sessionLiveData.x = 0;
  sessionLiveData.y = 0;
  sessionLiveData.Status = 0;
  sessionLiveData.prevStatus = 0;
}

module.exports = {
  client,
  db,
  sessionLiveData,
  sessionLiveClear
};

