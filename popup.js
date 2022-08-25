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
  chrome.storage.sync.get("googleToken", ({ googleToken }) => {
    console.log(googleToken);
    if (googleToken) {
      $("#google-done").addClass('d-none');
      fetchEvents(googleToken);
      
    } else {
      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        console.log(token);
        chrome.storage.sync.set({ googleToken: token });
        $("#google-done").addClass('d-none');

        fetchEvents(token);
      });
    }
  });
}

function fetchEvents(token) {
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
      listEvents(calendarId, token);
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

function listEvents(calendarId, token) {
  

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
        $("#google-done").removeClass('d-none');
        removeByClassName("google");

        events.forEach((element) => {
          appendNotifications(element.summary, element.htmlLink, "google")
        })
      });

}
function removeByClassName(class_name) {
  $(`.${class_name}`).remove();
}
function appendNotifications(title, url, class_name="test"){
  $("table").removeClass("d-none");
  let  body = `<tr class=${class_name}>
              <td><a href=${url}>${title}</a></td>
              </tr>`;
  $("#notifications").append(body)
}
function fetchGitlabData(gitLabPersonalToken) {
  console.log("fetchGitlabData");
  let fetch_options = {
    method: "GET",
    headers: {
      "PRIVATE-TOKEN": gitLabPersonalToken,
      "Content-Type": "application/json",
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
      $("#gitlab-input").addClass('d-none');
      $("#gitlab-done").removeClass('d-none');
      // sync chrome storage
      chrome.storage.sync.set({ gitlab_token: gitLabPersonalToken });
      removeByClassName("gitlab");

      if (data) {
        data.forEach((element) => {
          appendNotifications(element.title, element.web_url, "gitlab")
        })
      }
    })
    .catch((error) => {
      console.error("There was an error!", error);
    });
}

function fetchGithubData(githubPersonalToken) {
  console.log(githubPersonalToken);
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
        $("#github-input").addClass('d-none');
        $("#github-done").removeClass('d-none');
        console.log(review_requested_objects);
        removeByClassName("github");
        // Set Browser Storage
        review_requested_objects.forEach((element) => {
          appendNotifications(element.subject.title, element.url, "github")
        })
        chrome.storage.sync.set({ github_token: githubPersonalToken });
      }
    })
    .catch((error) => {
      // element.parentElement.innerHTML = `Error: ${error}`;
      console.error("There was an error!", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  let currentDate = new Date();

  let twoWeeksAgoDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 14
  );

  // Get chrome storages
  chrome.storage.sync.get("github_token", ({ github_token }) => {
    console.log("github token from storage: ", github_token);
  });

  getCalendarId();
});

let gitHubInput = document.getElementById("github-input");
let gitHubSubmit = document.getElementById("github-submit");

// Get Github submit input and button
let githubIcon = $("#github")
githubIcon.on("click", function(){
  chrome.storage.sync.get("github_token", ({ github_token }) => {
    if(github_token){
      $("#github-input").addClass('d-none');
      $("#github-done").removeClass('d-none');

    }else{
      $("#github-input").removeClass('d-none');
      $("#github-done").addClass('d-none');
    }
    fetchGithubData(github_token);
  });
});
let gitlabIcon = $("#gitlab")

gitlabIcon.on("click", function(){
  chrome.storage.sync.get("gitlab_token", ({ gitlab_token }) => {
    if(gitlab_token){
      $("#gitlab-input").addClass('d-none');
      $("#gitlab-done").removeClass('d-none');

    }else{
      $("#gitlab-input").removeClass('d-none');
      $("#gitlab-done").addClass('d-none');
    }
    fetchGitlabData(gitlab_token);
  });
});

$("#google").on("click", function(){
  getCalendarId();
});


$("#github-input").keyup(function () {
  gitHubToken = $(this).val();
  console.log("submit github token: ", gitHubToken);
  fetchGithubData(gitHubToken);
});

$("#gitlab-input").keyup(function () {
  gitLabToken = $(this).val();
  console.log("submit gitlab token: ", gitLabToken);
  fetchGitlabData(gitLabToken);
});


