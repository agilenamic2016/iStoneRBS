var regID="";
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('Received Device Ready Event');
        console.log('calling setup push');
    
        app.setupPush();
    },
    setupPush: function() {
        console.log('calling push init');
        var push = PushNotification.init({
            "android": {
                "senderID": "804997115089"
            },
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        console.log('after init');

        push.on('registration', function(data) {
            console.log('registration event: ' + data.registrationId);
            regID=data.registrationId;
            //alert("redid="+data.registrationId);
            //alert(regID);
            //storeRegID(data.registrationId);
            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
            }

            var parentElement = document.getElementById('registration');
            var listeningElement = parentElement.querySelector('.waiting');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            console.log('notification event');
//            navigator.notification.alert(
//                data.message,         // message
//                null,                 // callback
//                data.title,           // title
//                'Ok'                  // buttonName
//            );
       });
    }
};
//-------------------------------------------
//-------------------------------------------
//-------------------------------------------

function storeRegID(regid){
   
    db.transaction(function(tx) {
        tx.executeSql('DELETE FROM RegID');    
    });
    
    var dataObj = {
    values1 : [regid]
    };

    insertRegID(dataObj);

    function insertRegID(dataObj) {
        db.transaction(function(tx) {
            tx.executeSql(
                'INSERT INTO RegID (ID) VALUES (?)', 
                dataObj.values1,
                successStoreSessionKey,
                erroStoreSessionKey
            );
        });
    }
}


//-------------------------------------------
//-------------------------------------------
//-------------------------------------------
//button action in index page
function btnLogin_onClick(){
    loading.startLoading();
    
    var userName=$("#txtLoginId").val();
    var pwd=$("#txtPassword").val();
    //alert(regID);
    requetLogin(userName, pwd, regID);
//     dbmanager.getHistoryListFromDB(function(returnData){
//        
//            if(returnData.rows.length>0)
//            {
//                $.each(returnData.rows, function(key, value){
//                    var userName=$("#txtLoginId").val();
//                    var pwd=$("#txtPassword").val();
//                    alert(value.ID);
//                    requetLogin(userName, pwd, value.ID);
//                });       
//            }
//            else
//            {
//                var userName=$("#txtLoginId").val();
//                var pwd=$("#txtPassword").val();
//
//                requetLogin(userName, pwd, "");
//            }
//        });
    
    
}