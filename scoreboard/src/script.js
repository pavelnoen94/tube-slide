//Using the HiveMQ public Broker, with a random client Id
var client = new Paho.MQTT.Client("127.0.0.1", 9001, "myclientid_" + parseInt(Math.random() * 100, 10));

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({ onSuccess: onConnect });

function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("connected");
    client.subscribe("white/high_score");
    client.subscribe("white/status");
};

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}

function onMessageArrived(message) {
    if (message.payloadString == "busy") {
        STOPWATCH.handleClickReset()
        STOPWATCH.handleClickStart()
        return
    }

    if (message.payloadString == "empty") {
        return
    }

    if (message.payloadString == "reset") {
        STOPWATCH.handleClickStop()
        STOPWATCH.handleClickReset()
        return
    }

    json = JSON.parse(message.payloadString)

    last = new Number(json.last.time)
    today = new Number(json.today.time)
    week = new Number(json.week.time)
    month = new Number(json.month.time)
    record = new Number(json.ever.time)


    function parse_time(time) {
        // round the time to have 2 decimals
        time = parseFloat(time).toFixed(2)
        // extract the whole number
        seconds = parseInt(time)
        // get the first two digits of milliseconds
        milliseconds = parseInt((time - parseFloat(seconds)) * Math.pow(10, 2))

        if (seconds < 10) {
            seconds = "0" + seconds
        }
        if (milliseconds < 10) {
            milliseconds = "0" + milliseconds
        }

        return "00:" + seconds + ":" + milliseconds
    }

    // fill in records
    $("#record").text(parse_time(record))
    $("#month").text(parse_time(month))
    $("#week").text(parse_time(week))
    $("#today").text(parse_time(today))
    $("#last").text(parse_time(last))
    // stop the big timer
    STOPWATCH.handleClickStop()
    // update the big timer and hope no one notice the update
    $("#seconds").text(parse_time(last).slice(3, 5))
    $("#hundredths").text(parse_time(last).slice(6, 8))
}