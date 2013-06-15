$(function () {
    "use strict";
 
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
 
    var myColor = false;
    var myName = false;
 
    window.WebSocket = window.WebSocket || window.MozWebSocket;
 
    if (!window.WebSocket) {
        content.html($('<p></p>').html("Sorry, but your browser doesn't support WebSockets."));
        input.hide();
        $('span').hide();
        return;
    }
 
    var connection = new WebSocket('ws://127.0.0.1:1337');
 
    // handler on connection opened
    connection.onopen = function () {
        input.removeAttr('disabled');
        status.text('Choose name:');
    };
 
    // handler on connection error
    connection.onerror = function (error) {
        content.html($('<p></p>').html("Sorry, but there's some problem with your connection or the server is down."));
    };
 
    //handler for incoming messages
    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log("This doesn't look like a valid JSON: ", message.data);
            return;
        }
 
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus(); // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text, json.data[i].color, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            addMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
        } else {
            console.log("Hmm..., I've never seen JSON like this: ", json);
        }
    };
 
    // Send mesage when user presses Enter key
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) return;
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            input.attr('disabled', 'disabled');
 
            // we know that the first message sent from a user is his name
            if (myName === false) {
                myName = msg;
            }
        }
    });
    
    // to check whether server is online
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate with the WebSocket server.');
        }
    }, 3000);
    
    //add message to chat window
    function addMessage(author, message, color, dt) {
        content.prepend('<p><span style="color:' + color + '">' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');
    }
});