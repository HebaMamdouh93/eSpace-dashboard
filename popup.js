function createMeeting() {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log(token);

    //details about the event
    let event = {
      summary: "Google Api Implementation",
      description: "Create an event using chrome Extension",
      start: {
        dateTime: "2015-05-28T09:00:00-07:00",
        timeZone: "America/Los_Angeles",
      },
      end: {
        dateTime: "2015-05-28T09:00:00-07:00",
        timeZone: "America/Los_Angeles",
      },
    };

    let fetch_options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    };

    fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      fetch_options
    )
      .then((response) => response.json()) // Transform the data into json
      .then(function (data) {
        console.log(data); //contains the response of the created event
      });
  });
}

function getCalendarId() {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log(token);

    let fetch_options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      fetch_options
    )
      .then((response) => response.json()) // Transform the data into json
      .then(function (data) {
        console.log(data.items[0].id); //contains the response of the created event
        let calendarId = data.items[0].id;
        listEvents(calendarId);
      });
  });
}
function ISODateString(d) {
  function pad(n) {
    return n < 10 ? "0" + n : n;
  }
  return (
    d.getUTCFullYear() +
    "-" +
    pad(d.getUTCMonth() + 1) +
    "-" +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    ":" +
    pad(d.getUTCMinutes()) +
    ":" +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}
function monthString(num) {
  if (num === "01") {
    return "JAN";
  } else if (num === "02") {
    return "FEB";
  } else if (num === "03") {
    return "MAR";
  } else if (num === "04") {
    return "APR";
  } else if (num === "05") {
    return "MAJ";
  } else if (num === "06") {
    return "JUN";
  } else if (num === "07") {
    return "JUL";
  } else if (num === "08") {
    return "AUG";
  } else if (num === "09") {
    return "SEP";
  } else if (num === "10") {
    return "OCT";
  } else if (num === "11") {
    return "NOV";
  } else if (num === "12") {
    return "DEC";
  }
}
//--------------------- from num to day of week
function dayString(num) {
  if (num == "1") {
    return "mon";
  } else if (num == "2") {
    return "tue";
  } else if (num == "3") {
    return "wed";
  } else if (num == "4") {
    return "thu";
  } else if (num == "5") {
    return "fri";
  } else if (num == "6") {
    return "sat";
  } else if (num == "0") {
    return "sun";
  }
}
//--------------------- Add a 0 to numbers
function padNum(num) {
  if (num <= 9) {
    return "0" + num;
  }
  return num;
}

function AmPm(num) {
  if (num <= 12) {
    return "am " + num;
  }
  return "pm " + padNum(num - 12);
}

function listEvents(calendarId) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log(token);

    let fetch_options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    let currentDate = new Date();
    console.log(ISODateString(currentDate));
    // .toISOString();
    let nextMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    );

    console.log(ISODateString(nextMonthDate));

    fetch(
      "https://www.googleapis.com/calendar/v3/calendars/" +
        calendarId +
        "/events?timeMin=" +
        ISODateString(currentDate) +
        "&timeMax=" +
        ISODateString(nextMonthDate) +
        "&singleEvents=true&orderBy=starttime",
      fetch_options
    )
      .then((response) => response.json()) // Transform the data into json
      .then(function (data) {
        console.log(data); //contains the response of the created event
        const events = data.items;
        if (!events || events.length == 0) {
          document.getElementById("content").innerText = "No events found.";
          return;
        }
        // Flatten to string to display
        // const output = events.reduce(
        //   (str, event) => `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
        //   'Events:\n');
        // document.getElementById('content').innerText = output;

        for (var i = 0; i < events.length; i++) {
          var li = document.createElement("li");
          var item = events[i];
          var classes = [];
          var allDay = item.start.date ? true : false;
          var startDT = allDay ? item.start.date : item.start.dateTime;
          var dateTime = startDT.split("T"); //split date from time
          var date = dateTime[0].split("-"); //split yyyy mm dd
          var startYear = date[0];
          var startMonth = monthString(date[1]);
          var startDay = date[2];
          var startDateISO = new Date(
            startMonth + " " + startDay + ", " + startYear + " 00:00:00"
          );
          var startDayWeek = dayString(startDateISO.getDay());
          if (allDay == true) {
            //change this to match your needs
            var str = [
              '<font size="4" face="courier">',
              startDayWeek,
              " ",
              startMonth,
              " ",
              startDay,
              " ",
              startYear,
              '</font><font size="5" face="courier"> @ ',
              item.summary,

              "</font><br><br>",
            ];
          } else {
            var time = dateTime[1].split(":"); //split hh ss etc...
            var startHour = AmPm(time[0]);
            var startMin = time[1];
            var str = [
              //change this to match your needs
              '<font size="4" face="courier">',
              startDayWeek,
              " ",
              startMonth,
              " ",
              startDay,
              " ",
              startYear,
              " - ",
              startHour,
              ":",
              startMin,
              '</font><font size="5" face="courier"> @ ',
              item.summary,
              "</font><br><br>",
            ];
          }
          li.innerHTML = str.join("");
          li.setAttribute("class", classes.join(" "));
          document.getElementById("events").appendChild(li);
        }
      });
  });
}

function fetchGitlabData(gitLabPersonalToken) {
  console.log("fetchGitlabData");
  let fetch_options = {
    method: "GET",
    headers: {
      Authorization: `PRIVATE-TOKEN ${gitLabPersonalToken}`,
      "Content-Type": "application/json"
    },
  };
  fetch(
    "https://gitlab.qiwa.tech/api/v4/merge_requests?scope=assigned_to_me",
    fetch_options
  )
    .then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson ? await response.json() : null;

      // check for error response
      if (!response.ok) {
        // get error message from body or default to response status
        const error = (data && data.message) || response.status;
        return Promise.reject(error);
      }

      console.log(data);
      if (data) {
        var review_requested_objects = data.filter(
          (element) =>
            element.reason == "review_requested" || element.reason == "mention"
        );
        console.log(review_requested_objects);
      }
    })
    .catch((error) => {
      console.error("There was an error!", error);
    });
}

function fetchGithubData(githubPersonalToken, since) {
  let fetch_options = {
    method: "GET",
    headers: {
      Authorization: `token ${githubPersonalToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
  };
  fetch(
    "https://api.github.com/notifications?participating=true",
    fetch_options
  )
    .then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson ? await response.json() : null;

      // check for error response
      if (!response.ok) {
        // get error message from body or default to response status
        const error = (data && data.message) || response.status;
        return Promise.reject(error);
      }

      console.log(data);
      if (data) {
        var review_requested_objects = data.filter(
          (element) =>
            element.reason == "review_requested" || element.reason == "mention"
        );
        console.log(review_requested_objects);
      }
    })
    .catch((error) => {
      // element.parentElement.innerHTML = `Error: ${error}`;
      console.error("There was an error!", error);
    });
}



document.addEventListener("DOMContentLoaded", function () {
  const githubPersonalToken = "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";
  let currentDate = new Date();

  let twoWeeksAgoDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 14
  );
  // console.log(ISODateString(twoWeeksAgoDate));
  // // getCalendarId();
  fetchGithubData(githubPersonalToken);

  const gitLabPersonalToken = "3RNrdp7-bDeEV61QRDvv";
  fetchGitlabData(gitLabPersonalToken);
});
