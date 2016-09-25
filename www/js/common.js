var filtermenustatus=0;
var meetingid;
var detailRoomId;
//------------------------------------------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
//page loading

var loading = {
    
    //add loading page when calll
    startLoading:function(){
        $(".app").prepend("<div class='loadingPage'><div class='loadingFrame'><img class='loadingIcon' src='img/loader.gif'></img></div></div>");
    },
    
    //remove loading page when call
    endLoading:function(){
        $(".loadingPage").remove();
    }
};


//------------------------------------------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
//dbmanager
var db;

var dbmanager = {
    initdb:function(){
        try{db = window.openDatabase("Database", "1.0", "RBS", 200000);}
        catch(ex){alert(ex.message);}

    },
    
    createTable:function(){
        db.transaction(createTableTransaction, this.errorExecuteSQL, this.successExecuteSQL);
        
        function createTableTransaction(t){
            t.executeSql('CREATE TABLE IF NOT EXISTS sessionKey(token text, id int, registrationid text)');
            t.executeSql('CREATE TABLE IF NOT EXISTS roomList(id text, name text, photoUrl text)');
            t.executeSql('CREATE TABLE IF NOT EXISTS historyList(ID int, RoomID int, Title text, Purpose text, BookingDate text, StartingTime text, EndingTime text, rtype text, startdate text, enddate text)');
            t.executeSql('CREATE TABLE IF NOT EXISTS userhistoryList(ID int, RoomID int, Title text, Purpose text, BookingDate text, StartingTime text, EndingTime text)');
            t.executeSql('CREATE TABLE IF NOT EXISTS RegID(ID text)');
        }
    },
    
    logout:function(){
        db.transaction(createTableTransaction, this.errorExecuteSQL, this.successExecuteSQL);
        
        function createTableTransaction(t){
            t.executeSql('delete from sessionKey');
            t.executeSql('delete from roomList');
            t.executeSql('delete from historyList');
            t.executeSql('delete from RegID');
            t.executeSql('delete from userhistoryList');
        }
    },
    
    getSession:function(returnData){
        db.transaction(function(tx){
            tx.executeSql('SELECT * FROM sessionKey', [], function(tx, rs){
                returnData(rs);
          }, this.errorExecuteSQL);
        });
    },
    
    getRoomListFromDB:function(returnData){
        db.transaction(function(tx){
            tx.executeSql('SELECT * FROM roomList', [], function(tx, rs){
                returnData(rs);
          }, this.errorExecuteSQL);
        });
    },
    
    getHistoryListFromDB:function(returnData){
        db.transaction(function(tx){
            tx.executeSql('SELECT * FROM historyList order by BookingDate, StartingTime', [], function(tx, rs){
                returnData(rs);
          }, this.errorExecuteSQL);
        });
    },
    
    getUserHistoryListFromDB:function(returnData){
        db.transaction(function(tx){
            tx.executeSql('SELECT * FROM userhistoryList order by BookingDate, StartingTime', [], function(tx, rs){
                returnData(rs);
          }, this.errorExecuteSQL);
        });
    },
    
    getRegID:function(returnData){
        db.transaction(function(tx){
            tx.executeSql('SELECT * FROM RegID', [], function(tx, rs){
                returnData(rs);
          }, this.errorExecuteSQL);
        });
    },
    
    getHistoryListFromDBByID:function(returnData){
        db.transaction(function(tx){
            tx.executeSql('SELECT * FROM historyList where ID='+meetingid, [], function(tx, rs){
                returnData(rs);
          }, this.errorExecuteSQL);
        });
    },
    
    getRoomListFromDBById:function(returnData){
        db.transaction(function(tx){
            tx.executeSql('SELECT * FROM roomList where id='+detailRoomId, [], function(tx, rs){
                returnData(rs);
          }, this.errorExecuteSQL);
        });
    },
    
    successExecuteSQL:function(){
        //success to executeSQL
        //alert("success");
    },
    
    errorExecuteSQL:function(err){
        //fail executeSQL
        //alert(err.message);
    },
};

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//inbox page navigate
function goInbox(){
    window.location = "inboxPage.html";
}

function initInboxButton(){
    dbmanager.getProfile(function(returnData){
        if(returnData.rows.length>0)
            $(".inboxBtn").show();
    });
}


//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//inbox check new message

var inboxMessage={
    
    checkNewMessageNumber:function(){
        dbmanager.getProfile(function(returnData){
        if(returnData.rows.length>0)
            var token=returnData.rows.item(0).token;
            var uid=returnData.rows.item(0).uid;
            postNewInboxMessageCount(token, uid, "1");
        });
    },
}



//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//encode textarea input into html
function encode4HTML(str) {
    return str
        .replace(/\r\n?/g,'\n')
        // normalize newlines - I'm not sure how these
        // are parsed in PC's. In Mac's they're \n's
        .replace(/(^((?!\n)\s)+|((?!\n)\s)+$)/gm,'')
        // trim each line
        .replace(/(?!\n)\s+/g,' ')
        // reduce multiple spaces to 2 (like in "a    b")
        .replace(/^\n+|\n+$/g,'')
        // trim the whole string
        .replace(/[<>&"']/g,function(a) {
        // replace these signs with encoded versions
            switch (a) {
                case '<'    : return '&lt;';
                case '>'    : return '&gt;';
                case '&'    : return '&amp;';
                case '"'    : return '&quot;';
                case '\''   : return '&apos;';
            }
        })
        //.replace(/\n{2,}/g,'</p><br><p>')
        // replace 2 or more consecutive empty lines with these
        .replace(/\n/g,'<br />')
        // replace single newline symbols with the <br /> entity
        .replace(/^(.+?)$/,'<p>$1</p>');
        // wrap all the string into <p> tags
        // if there's at least 1 non-empty character
}


//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//thousand separator
function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//open link in new browser
function cordovaOpenLink(url){
    cordova.InAppBrowser.open(url, '_system');
}


//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//open parameter in url
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};