(function(){
/* 次回データ取得までの時間(分) */
var MINUTES_TO_NEXT_FETCH = 1,

/* 次のイベント通知を表示する時間(分) */
MINUTES_DISPLAYING_NOTICE = 5;

// データ取得
fetchEventData();

function fetchEventData() {
    $.ajax({
        url: "http://127.0.0.1:8080/event.json",
        dataType: "json",
        success: onReceiveEventData,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
}

function onReceiveEventData(data) {
    var date = new Date(),
        now = (date.getHours() * 60) + date.getMinutes(),
        nextEvent = getNextEvent(data, now),
        ongoingEvent = null,
        waitingMinutes = -1;

    if (nextEvent) {
        waitingMinutes = getWaitingMinutes(nextEvent, now);
    } else {
        waitingMinutes = -1;
    }
    console.log("waitingMinutes: " + waitingMinutes);
    ongoingEvent = getOngoingEvent(data, now);

    if (ongoingEvent) {
        // 開催中のイベントあり
        document.getElementById("notice").innerHTML = "<p>" + ongoingEvent.title + "開催中です。</p>";
        return;
    }

    if (waitingMinutes === -1) {
        // 待ちイベントなし
        document.getElementById("notice").innerHTML = "<p>本日の実験は終了しました。</p>";
        return;
    } else if (waitingMinutes <= MINUTES_DISPLAYING_NOTICE) {
        // MINUTES_DISPLAYING_NOTICE分以内に開始のイベントあり
        document.getElementById("notice").innerHTML = "<p>" + getNextEvent(data, now).title + "スタートまで、あと" + waitingMinutes + "分！</p>";
    } else {
        // MINUTES_DISPLAYING_NOTICE分以降に開催のイベントあり
        setTimeout(function() {
            console.log("fetching data...");
            fetchEventData();
        }, MINUTES_TO_NEXT_FETCH * 60 * 1000);
    }
}

function getWaitingMinutes(ev, now) {
    var i = 0,
        hour = 0,
        minute = 0,
        startTime = "",
        startMinutes = 0;
    startTime = ev.startTime;
    hour = startTime.split(":")[0] - 0;
    minute = startTime.split(":")[1] - 0;
    startMinutes = (hour * 60) + minute;
    return startMinutes - now;
}

function getOngoingEvent(data, now) {
    var i = 0,
        hour = 0,
        minute = 0,
        startTime = "",
        endTime = "",
        startMinutes = 0,
        endMinutes = 0;
    for (i = 0; i < data.events.length; i++) {
        // start time
        startTime = data.events[i].startTime;
        hour = startTime.split(":")[0] - 0;
        minute = startTime.split(":")[1] - 0;
        startMinutes = (hour * 60) + minute;
        // end time
        endTime = data.events[i].endTime;
        hour = endTime.split(":")[0] - 0;
        minute = endTime.split(":")[1] - 0;
        endMinutes = (hour * 60) + minute;
        if (startMinutes <= now && now <= endMinutes) {
            return data.events[i];
        }
    }
    return null;
}

function getNextEvent(data, now) {
    var i = 0,
        hour = 0,
        minute = 0,
        startTime = "",
        startMinutes = 0;
    for (i = 0; i < data.events.length; i++) {
        startTime = data.events[i].startTime;
        hour = startTime.split(":")[0] - 0;
        minute = startTime.split(":")[1] - 0;
        startMinutes = (hour * 60) + minute;
        if (startMinutes <= now) {
            continue;
        }
        return data.events[i];
    }
    return null;
}

})();
