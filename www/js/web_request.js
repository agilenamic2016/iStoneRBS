var domainUrl="http://52.207.238.42";
var webUrl = domainUrl+"/RBS/api";
var imageUrl=domainUrl+"/upload/";
//var webUrl = "http://localhost:11175/api";

var apiTimeout=30000;

function requetLogin(userName, pwd, regid){
    var requestUrl=webUrl+"/RBS/getlogin";
    
    var jsonObj = {UserName :userName,Password :pwd, TokenID: regid};
    
    $.ajax({
      url: requestUrl,
      type: "POST",
      ContentType: "application/json",
      async: true, 
      dataType : "JSON",
      data:jsonObj,
      timeout: apiTimeout,    
      success: function(data, status, xhr) {
        debugger;    

        if(data.SessionKey.length!=0){
            storeSessionKey(data.SessionKey, data.UserID, '');
        }
        else{
           alert("Login failed.");
           loading.endLoading();
        }
        
      },
      error:function (xhr, ajaxOptions, thrownError){
        debugger;
        alert("Login failed.");
        loading.endLoading();
      }
    })
}

function storeSessionKey(sessionKey, id, registrationid){
    var profile = {
    values1 : [sessionKey, id, registrationid]
    };
    
    insertSessionKey(profile);
    
    function insertSessionKey(profile) {
        db.transaction(function(tx) {
            tx.executeSql('DELETE FROM sessionKey');
            tx.executeSql(
                'INSERT INTO sessionKey (token, id, registrationid) VALUES (?, ?, ?)', 
                profile.values1,
                successStoreSessionKeyLogin,
                erroStoreSessionKeyLogin
            );
        });
    }
}

function successStoreSessionKeyLogin(){
   // alert("success store key");
    loading.endLoading();
    window.location="menu.html";
}

function erroStoreSessionKeyLogin(err){
  //  alert("failed");
    loading.endLoading();
    alert("Login failed."+err);
}




function getRoomList(sessionkey){
    var requestUrl=webUrl+"/RBS/GetRooms";
    var jsonObj = {SessionKey :sessionkey};
    
    $.ajax({
      url: requestUrl,
      type: "POST",
      ContentType: "application/json",
      async: true, 
      dataType : "JSON",
      data:jsonObj,
      timeout: apiTimeout,    
      success: function(data, status, xhr) {
        debugger;    
       
        storeRoomList(data);
        
        
        dbmanager.getRoomListFromDB(function(returnData){
           
            if(returnData.rows.length>0)
            {
                for(var i=0;i<returnData.rows.length;i++){
                    
                    var roomname='"'+returnData.rows.item(i).name+'"';
                    $("#scrollul").append("<li class='scrollli' id='featuredrow1' onclick='goCalendar("+returnData.rows.item(i).id+", "+roomname+");'><table style='height:100%; width:100%;'><tr><td style='width:20%' ><img class='listviewimg' src='"+imageUrl+returnData.rows.item(i).photoUrl+"'></td><td><h1 class='listviewitemtitle'>"+returnData.rows.item(i).name+"</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'></p></td></tr></table></li>");
                }
        
//                $.each(returnData.rows, function(key, value){
//                    var roomname='"'+value.name+'"';
//                    $("#scrollul").append("<li class='scrollli' id='featuredrow1' onclick='goCalendar("+value.id+", "+roomname+");'><table style='height:100%; width:100%;'><tr><td style='width:20%' ><img class='listviewimg' src='"+imageUrl+value.photoUrl+"'></td><td><h1 class='listviewitemtitle'>"+value.name+"</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'></p></td></tr></table></li>");
//                });       
            }
            else
            {
                $("#scrollul").append("<li class='scrollli' id='featuredrow1'><table style='height:100%; width:100%;'><tr><td style='width:20%' ></td><td><h1 class='listviewitemtitle'>No data</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'></p></td></tr></table></li>");
            }
        });
    
        loading.endLoading();
      },
      error:function (xhr, ajaxOptions, thrownError){
        debugger;
        if(xhr.statusText=="Unauthorized"){
            alert("Session timeout. Please login again.");
            dbmanager.logout();
            window.location="index.html";
            
        }
        else{
            alert("Failed to retrieve data.");
            loading.endLoading();   
        }
      }
    })
}

function storeRoomList(data){
   
    db.transaction(function(tx) {
        tx.executeSql('DELETE FROM roomList');    
    });
    
    $.each(data, function(key, value){
        var dataObj = {
        values1 : [value.ID.toString(), value.Name, value.PhotoFileName]
        };

        insertRoomList(dataObj);

        function insertRoomList(dataObj) {
            db.transaction(function(tx) {
                tx.executeSql(
                    'INSERT INTO roomList (id, name, photoUrl) VALUES (?,?,?)', 
                    dataObj.values1,
                    successStoreRoomList,
                    erroStoreStoreRoomList
                );
            });
        }
    });
}

function successStoreRoomList(){
    //alert("success store key");
}

function erroStoreStoreRoomList(err){
    alert("Failed to retrieve data.");
    loading.endLoading();
}

function getEventList(sessionkey, userid){
    var requestUrl=webUrl+"/RBS/GetMeetingsByUserId";
    var jsonObj = {SessionKey :sessionkey, UserID: userid};
    
    $.ajax({
      url: requestUrl,
      type: "POST",
      ContentType: "application/json",
      async: true, 
      dataType : "JSON",
      data:jsonObj,
      timeout: apiTimeout,    
      success: function(data, status, xhr) {
        debugger;  
        
        //alert(JSON.stringify(data)); 
        
        storeHistoryList(data);
        
        
        dbmanager.getHistoryListFromDB(function(returnData){
            var your_dates=[];
            if(returnData.rows.length>0)
            {
        
                for(var i=0;i<returnData.rows.length;i++){
                    var newdate=returnData.rows.item(i).BookingDate.split("T");
                    var newsTime=returnData.rows.item(i).StartingTime.substr(0,2)+":"+returnData.rows.item(i).StartingTime.substr(2,2);
                    var neweTime=returnData.rows.item(i).EndingTime.substr(0,2)+":"+returnData.rows.item(i).EndingTime.substr(2,2);

                    $("#scrollul").append("<li class='scrollli' id='featuredrow1' onclick='gotoDetails("+returnData.rows.item(i).ID+", "+returnData.rows.item(i).RoomID+")'><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle'>"+returnData.rows.item(i).Title+"</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'>DateTime: "+newdate[0]+" "+newsTime+" - "+neweTime+"</p></td></tr></table> </li>");
                    
                    your_dates.push(new Date(newdate[0].substr(0,4), newdate[0].substr(5,2)-1, newdate[0].substr(8,2)));
    
                }
           
                $( "#datepicker" ).datepicker({ 
                    altField: '#dateBooking',
                    beforeShowDay: function(date) {
                          // check if date is in your array of dates
                          if(inArrayDates(date, your_dates)==-1) {
                             // if it is return the following.
                             return [true, 'css-class-to-highlight', ''];
                          } else {
                             // default
                             return [true, '', ''];
                          }
                       }
                  });
//                $.each(returnData.rows, function(key, value){
//                    var newdate=value.BookingDate.split("T");
//                    var newsTime=value.StartingTime.substr(0,2)+":"+value.StartingTime.substr(2,2);
//                    var neweTime=value.EndingTime.substr(0,2)+":"+value.EndingTime.substr(2,2);
//
//                    $("#scrollul").append("<li class='scrollli' id='featuredrow1'><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle'>"+value.Title+"</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'>DateTime: "+newdate[0]+" "+newsTime+" - "+neweTime+"</p></td></tr></table> </li>");
//                });       
            }
            else
            {
                $("#scrollul").append("<li class='scrollli' id='featuredrow1'><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle'>No data</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'></p></td></tr></table> </li>");
            }
        });

//        if(data.length>0)
//        {
//        try{$.each(data, function(key, value){
//                var newdate=value.BookingDate.split("T");
//                var newsTime=value.StartingTime.substr(0,2)+":"+value.StartingTime.substr(2,2);
//                var neweTime=value.EndingTime.substr(0,2)+":"+value.EndingTime.substr(2,2);
//
//                $("#scrollul").append("<li class='scrollli' id='featuredrow1'><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle'>"+value.Title+"</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'>DateTime:"+newdate[0]+" "+newsTime+" - "+neweTime+"</p></td></tr></table> </li>");
//            });   }catch(ex){alert(ex.message)}
//              
//        }
//        else
//        {
//            alert("no data");
//        }

        loading.endLoading();
      },
      error:function (xhr, ajaxOptions, thrownError){
        debugger;
        if(xhr.statusText=="Unauthorized"){
            alert("Session timeout. Please login again.");
            dbmanager.logout();
            window.location="index.html";
            
        }
        else{
            alert("Failed to retrieve data.");
        loading.endLoading();  
        }
        
      }
    })
}


function storeUserHistoryList(data){
   
    db.transaction(function(tx) {
        tx.executeSql('DELETE FROM userhistoryList');    
    });
    
    $.each(data, function(key, value){
        
        var dataObj = {
        values1 : [value.ID, value.RoomID, value.Title, value.Purpose, value.BookingDate, value.StartingTime, value.EndingTime]
        };

        insertUserHistoryListList(dataObj);

        function insertUserHistoryListList(dataObj) {
            db.transaction(function(tx) {
                tx.executeSql(
                    'INSERT INTO userhistoryList (ID, RoomID, Title, Purpose, BookingDate, StartingTime, EndingTime) VALUES (?,?,?,?,?,?,?)', 
                    dataObj.values1,
                    successStoreEventList,
                    erroStoreStoreEventList
                );
            });
        }
    });
}

function successStoreEventList(){
   // alert("success store key");
}

function erroStoreStoreEventList(err){
    alert("Failed to retriev data.");
    loading.endLoading();
}


function bookRoom(sessionkey, title, purpose, date, stime, etime, roomid, repeattype, startdate, enddate){
    var requestUrl=webUrl+"/RBS/Booking";
    
    var newdate=date.split("/");//date.substring(7,4);//+"-"+date.substring(0,2)+"-"+date.substring(3,2);
    var newstime=stime.split(":")//stime.substring(0,2);//+stime.substring(3,2);
    var newetime=etime.split(":")//etime.substring(0,2);//+etime.substring(3,2);
    var submitStartDate="";
    var submitEndDate="";
    date=newdate[2]+"-"+newdate[0]+"-"+newdate[1];
    stime=newstime[0]+newstime[1];
    etime=newetime[0]+newetime[1];
    
    if(repeattype.trim()=="No Repeat"){
        submitStartDate=date;
        submitEndDate=date;
    }   
    else{
        var newstartdate=startdate.split("/");//date.substring(7,4);//+"-"+date.substring(0,2)+"-"+date.substring(3,2);
        submitStartDate=newstartdate[2]+"-"+newstartdate[0]+"-"+newstartdate[1];

        var newenddate=enddate.split("/");//date.substring(7,4);//+"-"+date.substring(0,2)+"-"+date.substring(3,2);
        submitEndDate=newenddate[2]+"-"+newenddate[0]+"-"+newenddate[1];
            
    }
    
    
    var repeattypeno=0;
    
    if(repeattype=="No Repeat")
        repeattypeno=0;
    else if(repeattype=="Daily")
        repeattypeno=1;
    else if(repeattype=="Weekly")
        repeattypeno=2;
    else if(repeattype=="Monthly")
        repeattypeno=3;
    
    var jsonObj = {SessionKey :sessionkey, Title: title, Purpose: purpose, BookingDate:date, StartingTime:stime, EndingTime:etime, RoomID:roomid, RecurrenceType:repeattypeno, SCCStartDate:submitStartDate, SCCEndDate:submitEndDate};

    $.ajax({
      url: requestUrl,
      type: "POST",
      ContentType: "application/json",
      async: true, 
      dataType : "JSON",
      data:jsonObj,
      timeout: apiTimeout,    
      success: function(data, status, xhr) {
        debugger;    

        alert("Room Booked Successfully.");
        
        loading.endLoading();
        window.location="attlist.html?id="+data[0].ID;
      },
      error:function (xhr, ajaxOptions, thrownError){
        debugger;
        
        var jsonResponse = JSON.parse(xhr.responseText);
        
        if(xhr.statusText=="Unauthorized"){
            alert("Session timeout. Please login again.");
            dbmanager.logout();
            window.location="index.html";
            
        }
        else if(jsonResponse.Message=="This time slot has been booked."){
            alert("This time slot has been booked.");
            loading.endLoading();
        }
        else{
             alert("Book Room Failed");
            loading.endLoading();
        }
       
      }
    })
}


function bookingHistory(sessionkey, date,roomid){
    var requestUrl=webUrl+"/RBS/GetTimeSlotByRoomId";
    
    var newdate=date.split("/");//date.substring(7,4);//+"-"+date.substring(0,2)+"-"+date.substring(3,2);
    date=newdate[2]+"-"+newdate[0]+"-"+newdate[1];
    
    var jsonObj = {SessionKey :sessionkey, Date:date, RoomID:roomid};
    
    $.ajax({
      url: requestUrl,
      type: "POST",
      ContentType: "application/json",
      async: true, 
      dataType : "JSON",
      data:jsonObj,
      timeout: apiTimeout,    
      success: function(data, status, xhr) {
        debugger;    

        
        storeHistoryList(data);
        
        
        dbmanager.getHistoryListFromDB(function(returnData){
        
            if(returnData.rows.length>0)
            {
                for(var i=0;i<returnData.rows.length;i++){
                    var newdate=returnData.rows.item(i).BookingDate.split("T");
                    var newsTime=returnData.rows.item(i).StartingTime.substr(0,2)+":"+returnData.rows.item(i).StartingTime.substr(2,2);
                    var neweTime=returnData.rows.item(i).EndingTime.substr(0,2)+":"+returnData.rows.item(i).EndingTime.substr(2,2);

                    $("#scrollul").append("<li class='scrollli' id='featuredrow1'><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle'>"+returnData.rows.item(i).Title+"</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'>DateTime: "+newdate[0]+" "+newsTime+" - "+neweTime+"</p></td></tr></table> </li>");
                }
//                $.each(returnData.rows, function(key, value){
//                    var newdate=value.BookingDate.split("T");
//                    var newsTime=value.StartingTime.substr(0,2)+":"+value.StartingTime.substr(2,2);
//                    var neweTime=value.EndingTime.substr(0,2)+":"+value.EndingTime.substr(2,2);
//
//                    $("#scrollul").append("<li class='scrollli' id='featuredrow1'><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle'>"+value.Title+"</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'>DateTime: "+newdate[0]+" "+newsTime+" - "+neweTime+"</p></td></tr></table> </li>");
//                });       
            }
            else
            {
                alert("no data");
            }
        });
    
    
        loading.endLoading();
      },
      error:function (xhr, ajaxOptions, thrownError){
        debugger;
        if(xhr.statusText=="Unauthorized"){
            alert("Session timeout. Please login again.");
            dbmanager.logout();
            window.location="index.html";
            
        }
        else{
            alert("Failed to retrieve data");
            loading.endLoading();
        }
        
      }
    })
}

function storeHistoryList(data){
   
    db.transaction(function(tx) {
        tx.executeSql('DELETE FROM historyList');    
    });
    
    $.each(data, function(key, value){
        
        var dataObj = {
        values1 : [value.ID, value.RoomID, value.Title, value.Purpose, value.BookingDate, value.StartingTime, value.EndingTime]
        };

        insertHistoryListList(dataObj);

        function insertHistoryListList(dataObj) {
            db.transaction(function(tx) {
                tx.executeSql(
                    'INSERT INTO historyList (ID, RoomID, Title, Purpose, BookingDate, StartingTime, EndingTime) VALUES (?,?,?,?,?,?,?)', 
                    dataObj.values1,
                    successStoreBookingHistoryList,
                    erroStoreBookingHistoryList
                );
            });
        }
    });
}

function successStoreBookingHistoryList(){
   // alert("success store key");
}

function erroStoreBookingHistoryList(err){
    alert("Failed to retrieve data.");
    loading.endLoading();
}

function getUserList(sessionkey){
    var requestUrl=webUrl+"/RBS/GetUsers";
    var jsonObj = {SessionKey :sessionkey};
    
    $.ajax({
      url: requestUrl,
      type: "POST",
      ContentType: "application/json",
      async: true, 
      dataType : "JSON",
      data:jsonObj,
      timeout: apiTimeout,    
      success: function(data, status, xhr) {
        debugger;    
        
        if(data.length>0)
        {
            $.each(data, function(key, value){
                $("#scrollul").append("<li class='scrollli' id='featuredrow1'><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle'>"+value.Username+"</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'></p><td><input type='checkbox' id='userlist' class='userlist' value='"+value.ID+"' style='float:right'></td></tr></table></li>");
            });       
        }
        else
        {                
            $("#scrollul").append("<li class='scrollli' id='featuredrow1'><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle'>No data</h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails'></p><td></td></tr></table></li>");
        }

    
        loading.endLoading();
      },
      error:function (xhr, ajaxOptions, thrownError){
        debugger;
        
        alert("Failed to retrieve data");
        loading.endLoading();
      }
    })
}


function addAttList(sessionkey, meetingid, ID){
    var requestUrl=webUrl+"/RBS/AddAttendee";
    var jsonObj = {SessionKey :sessionkey, MeetingID:meetingid, Users:ID};

    $.ajax({
      url: requestUrl,
      type: "POST",
      ContentType: "application/json",
      async: true, 
      dataType : "JSON",
      data:jsonObj,
      timeout: apiTimeout,    
      success: function(data, status, xhr) {
        debugger;    
        
        loading.endLoading();
        window.location="menu.html";
      },
      error:function (xhr, ajaxOptions, thrownError){
        debugger;
        if(xhr.statusText=="Unauthorized"){
            alert("Session timeout. Please login again.");
            dbmanager.logout();
            window.location="index.html";
            
        }
        else{
            alert("Failed to call server "+JSON.stringify(xhr));
            loading.endLoading();
        }
        
      }
    })
}

function getAtteendeeList(sessionkey, meetingid){
    var requestUrl=webUrl+"/RBS/GetAttendeesByMeetingId";
    var jsonObj = {SessionKey :sessionkey, MeetingID:meetingid};
    
    $.ajax({
      url: requestUrl,
      type: "POST",
      ContentType: "application/json",
      async: true, 
      dataType : "JSON",
      data:jsonObj,
      timeout: apiTimeout,    
      success: function(data, status, xhr) {
        debugger;    
       
        var userList="";
       
        for(var z=0; z<data.length; z++){
            var count=z+1;
            userList=userList+count+") "+data[z].Username+"<br>";
        }
    
        $("#scrollul").append("<li class='scrollli' id='featuredrow1'><br><table style='height:100%; width:100%;'><tr><td><h1 class='listviewitemtitle' style='font-size:5vw;line-height:6vw'>Attendees: </h1><p class='listviewitemseperator'>&nbsp;</p><p class='listviewitemdetails' style='font-size:4vw;line-height:5vw'>"+userList+"</p></td></tr></table></li>");

        loading.endLoading();
      },
      error:function (xhr, ajaxOptions, thrownError){
        debugger;
        if(xhr.statusText=="Unauthorized"){
            alert("Session timeout. Please login again.");
            dbmanager.logout();
            window.location="index.html";
            
        }
        else{
            alert("Failed to retrieve data.");
            loading.endLoading();   
        }
      }
    })
}


function successStoreSessionKey(){
   // alert("success store key");
}

function erroStoreSessionKey(err){
  //  alert("failed");
}