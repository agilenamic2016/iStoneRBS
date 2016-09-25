/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

//-------------------------------------------
//-------------------------------------------
//-------------------------------------------
//button booking
function btnBooking_onClick(){
    loading.startLoading();
    
}

function recurringDates(startDate, endDate, interval, intervalType, noweekends) {
    intervalType = intervalType || 'Date';
    var date = startDate;
    var recurrent = [];
    var setget = {set: 'set'+intervalType, get: 'get'+intervalType};

    while (date < endDate) {
      recurrent.push( noweekends ? noWeekend() : new Date(date) );
      date[setget.set](date[setget.get]()+interval);
    }

    // add 1 day for sunday, subtract one for saturday
    function noWeekend() {
        var add, currdate = new Date(date), day = date.getDay();
        if (~[6,0].indexOf(day)) {
          currdate.setDate(currdate.getDate() + (add = day == 6 ? -1 : 1));
        }
        return new Date(currdate);
    }

    return recurrent;
}
