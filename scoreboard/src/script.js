const debugging = true;

const broker_address = document.location.href.substr(7,14); // get the address of the server
const slide = window.location.search.substr(1) || "white"; // get everything after the address and question mark. eg: 127.0.0.1:8000/?parameter returns parameter. Fallback to white
const port_number = 9001;


//Using the HiveMQ public Broker, with a random client Id
var client = new Paho.MQTT.Client(broker_address, port_number, "myclientid_" + parseInt(Math.random() * 100, 10));

// event handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({ onSuccess: onConnect });


function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("connected");
    client.subscribe(slide + "/high_score");
    client.subscribe(slide + "/status");
    $("#title").text(slide + " slide");

    // TODO: Remove modal if connection is restored
};


function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
    // TODO: Modal that the connection is lost
}


function onMessageArrived(message) {
    if(debugging){
        console.log(message.payloadString);
    }

    if (message.payloadString == "busy") {
        STOPWATCH.handleClickReset();
        STOPWATCH.handleClickStart();
        return;
    }

    if (message.payloadString == "empty") {
        return;
    }

    if (message.payloadString == "reset") {
        STOPWATCH.handleClickStop();
        STOPWATCH.handleClickReset();
        return;
    }

    if (message.payloadString == "shut down") {
        STOPWATCH.handleClickStop();
        STOPWATCH.handleClickReset();
        return;
    }

    if (message.payloadString == "active") {
        return;
    }

    if (message.payloadString == "reset high score") {
        const no_time = "00:00:00";
        $("#record").text(no_time);
        $("#month").text(no_time);
        $("#week").text(no_time);
        $("#today").text(no_time);
        $("#last").text(no_time);
        return;
    }

    update_records(message.payloadString);

}


function update_records(json_payload){
    try {
        json = JSON.parse(json_payload);
    } catch(TypeError) {
        console.log("[Warning]: message is not a valid json object");
        return;
    }

    last = new Number(json.last.time);
    today = new Number(json.today.time);
    week = new Number(json.week.time);
    month = new Number(json.month.time);
    record = new Number(json.ever.time);

    // fill in records
    $("#record").text(parse_time(record));
    $("#month").text(parse_time(month));
    $("#week").text(parse_time(week));
    $("#today").text(parse_time(today));
    $("#last").text(parse_time(last));

    // stop the big timer
    STOPWATCH.handleClickStop();

    // update the big timer and hope no one notice the update
    $("#seconds").text(parse_time(last).slice(3, 5));
    $("#hundredths").text(parse_time(last).slice(6, 8));
}


function parse_time(time) {
    // round the time to have 2 decimals
    time = parseFloat(time).toFixed(2);

    // extract the whole number
    seconds = parseInt(time);

    // get the first two digits of milliseconds
    milliseconds = parseInt((time - parseFloat(seconds)) * Math.pow(10, 2));

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    if (milliseconds < 10) {
        milliseconds = "0" + milliseconds;
    }

    return "00:" + seconds + ":" + milliseconds;
}
