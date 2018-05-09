var config = {
    apiKey: "AIzaSyCyNFAI-0MNNa5T6_sAESbtrXnbqwQ8Av4",
    authDomain: "rps-game-ca343.firebaseapp.com",
    databaseURL: "https://rps-game-ca343.firebaseio.com",
    projectId: "rps-game-ca343",
    storageBucket: "",
    messagingSenderId: "1020585701712"
};
firebase.initializeApp(config);

var database = firebase.database();


var username = "";
var opponent = "";
var currentChat = {};
function updateUser(){
    database.ref("users").once("value", function(snapshot){
        var data = snapshot.val();
        data[username] = {
            online: "ready",
            move: "none",
            wins: 0,
            losses: 0
        }
        database.ref("users").set(data);
    });
}
function updateChat(userName, chatMessage){
    var key = database.ref().child("chat").push().key;
    var updateChat = {};
    updateChat["/chat/" + key] = {
        user: userName,
        chat: chatMessage
    };
    database.ref().update(updateChat);
}
function waitForOpponent(){
    database.ref("users").on("value", function(snapshot){
        var data =  snapshot.val();
        if(Object.keys(data).length == 3){
            database.ref("users").off();
            gameStart();
            
        }
    });
}
function gameStart(){
    database.ref("users").once("value", function(snapshot2){
        var users = snapshot2.val();
        $.each(users, function(key, value){
            if(key!=username && key!= "test"){
                opponent = key;
            }
        });
        $("#userName").text(username);
        $("#opponentName").text(opponent);
    });
    $("#loading").addClass("d-none");
    $("#game").removeClass("d-none");
    database.ref("users").on("value", function(snapshot){
        var data = snapshot.val();
        if(Object.keys(data).length ==3){
            if(data[username].move != "none" && data[opponent].move!="none"){
                //logic
                $("#opponentChoice").text(data[opponent].move);
                rpsLogic(data[username].move, data[opponent].move);
            }
        }
    });
    database.ref("chat").on("value", function(snapshot){
        var data = snapshot.val();
        if(Object.keys(data).length>1){
            var chat = "";
            $.each(data, function(key, value){
                if(key != "test"){
                    chat += value.user + ": " + value.chat + "\n\n";
                }
            });
            $("#chat").val(chat);
            var textarea = document.getElementById('chat');
            textarea.scrollTop = textarea.scrollHeight;
        }
    });
}
function updateScore(win, appendNum){
    database.ref("users/" + username).once("value", function(snapshot){
        var data = snapshot.val();
        if(win){
            data.wins += appendNum;
        }else{
            data.losses += appendNum;
        }
        $("#wins").text(data.wins);
        $("#losses").text(data.losses);
        setTimeout(function(){resetMove(data)}, 3000);
    });
}
function resetMove(data){
    data.move = "none";
    database.ref("users/" + username).set(data);
    $("#userChoice").text("none");
    $("#opponentChoice").text("none");

    $("#rock").removeClass("disabled");
    $("#paper").removeClass("disabled");
    $("#scissor").removeClass("disabled");
    $("#rock").prop("disabled", false);
    $("#paper").prop("disabled", false);
    $("#scissor").prop("disabled", false);
}
function rpsLogic(userMove, opponentMove){
    
    
    if(userMove == "rock" && opponentMove == "scissor"){
        updateScore(true, 1);
    }else if(userMove == "rock" && opponentMove == "paper"){
        updateScore(false, 1);
    }else if(userMove == "scissor" && opponentMove == "paper"){
        updateScore(true, 1);
    }else if(userMove == "paper" && opponentMove == "rock"){
        updateScore(true, 1);
    }else if(userMove == "paper" && opponentMove == "scissor"){
        updateScore(false, 1);
    }else if(userMove == "scissor" && opponentMove == "rock"){
        updateScore(false, 1);
    }else{
        database.ref("users/" + username).once("value", function(snapshot){
            var data = snapshot.val();
            resetMove(data);
        });
    }
}
$("#sendMessage").on("click", function(event){
    event.preventDefault();
    if($("#message").val()){
        updateChat(username, $("#message").val());
        $("#message").val("");
    }
});
$("#sendConfig").on("click", function(){
    event.preventDefault();
    $("#config").hide();
    $("#loading").removeClass("d-none");
    username = $("#inputUsername").val().trim();
    database.ref("chat").once("value", function(snapshot){
        var chat = snapshot.val();
        $.each(chat, function(key, value){
            if(key!="test"){
                delete chat[key];
            }
        });
        database.ref("chat").set(chat);
    });
    database.ref("users").once("value", function(snapshot){
        var users = snapshot.val();
        if(Object.keys(users).length > 2){
            $.each(users, function(key, value){
                if(key != "test"){
                    delete users[key];
                }
            });
            database.ref("users").set(users, function(err){
                updateUser();
                waitForOpponent();
            });
        }else if(Object.keys(users).length ==2){
            updateUser();
            gameStart();
        }else{
            updateUser();
            waitForOpponent();
        }
    })
});
$("#rock, #paper, #scissor").on("click", function(event){
    event.preventDefault();
    var disabled = $(this).prop("disabled");
    var _this = this;
    if(!disabled){
        $("#rock").prop("disabled", true);
        $("#paper").prop("disabled", true);
        $("#scissor").prop("disabled", true);
        $("#rock").addClass("disabled");
        $("#paper").addClass("disabled");
        $("#scissor").addClass("disabled", true);
        database.ref("users/" + username).once("value", function(snapshot){
            var data = snapshot.val();
            data.move = $(_this).data("rps");
            console.log(data.move);
            database.ref("users/" + username).set(data);
            $("#userChoice").text(data.move);
        });
    }
});
$(window).on("keydown", function(event){
    console.log(event.which);
    if(event.which == 13){
        event.preventDefault();
    }
});
