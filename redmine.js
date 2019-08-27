var cesRdmUsersUrl = "/redmine/users.json";
var cesRdmProjectsUrl = "/redmine/projects.json";
var cesRdmMembershipsUrl = "/redmine/projects/%%project%%/memberships.json";
var cesRdmIssuesUrl = "/redmine/projects/%%project%%/issues.json";
var cesRdmIssueUrl = "/redmine/issues/%%issue%%.json";
var cesRdmTimeEntriesUrl ="/redmine/projects/%%project%%/time_entries.json";
var cesRdmVersionsUrl = "/redmine/projects/%%project%%/versions.json";

function cesRdmApiCall(url, node) {

  url = userProperties.getProperty('FQDN') + url;
  var params = {
    "method":"GET",
    "headers":JSON.parse(userProperties.getProperty('AUTH_HEADER'))
  };  
  
  var limit = 100;
  var totalCountUrl = url;
  try {
     var response = UrlFetchApp.fetch(totalCountUrl, params);
  }
  catch(err) {
    return "ERROR: " + err.message;
  }
  
  var json = response.getContentText();
  var data = JSON.parse(json);
  var totalCount = data.total_count;
  
  if (totalCount > 0) {
    
    var roundtrips = Math.ceil(totalCount / limit);
  
    var headerArray = Object.keys(data[node][0]);
    headerArray.splice(headerArray.indexOf("custom_fields"), 1);
    var resultArray = [headerArray];
  
    var responseUrl = url;

    for (n=0; n<roundtrips; n++) {
      responseUrl = url + "offset="+(n*limit)+"&limit="+limit;
      response = UrlFetchApp.fetch(responseUrl, params);
      json = response.getContentText();
      data = JSON.parse(json);

      for (var i in data[node]) {
        var subArray = [];
        for (var j in headerArray) {
          if (typeof data[node][i][headerArray[j]] === "object" && data[node][i][headerArray[j]] != null) {
            // TODO: handle roles in memberships
            if (headerArray[j] == "issue") {
              subArray.push(data[node][i][headerArray[j]]["id"]);
            } else {
              subArray.push(data[node][i][headerArray[j]]["name"]);
            }
          } else {
            subArray.push(data[node][i][headerArray[j]]);
          }
        }
        resultArray.push(subArray);
      }
    }
  } else {
    var resultArray = ["WARNING: Empty dataset returned."];
  }

  return resultArray;

}

function cesRdmIssueApiCall(url, node) {

  url = userProperties.getProperty('FQDN') + url;
  var params = {
    "method":"GET",
    "headers":JSON.parse(userProperties.getProperty('AUTH_HEADER'))
  };  
  
  var response = UrlFetchApp.fetch(url, params);
  var json = response.getContentText();
  var data = JSON.parse(json);

  var headerArray = Object.keys(data[node]);
  headerArray.splice(headerArray.indexOf("custom_fields"), 1);
  
  var resultArray = [headerArray];

  var subArray = [];
  for (var j in headerArray) {
    if (typeof data[node][headerArray[j]] === "object" && data[node][headerArray[j]] != null) {
      subArray.push(data[node][headerArray[j]]["name"]);
    } else {
      subArray.push(data[node][headerArray[j]]);
    }
  }
  resultArray.push(subArray);

  return resultArray;
}

function cesRdmCFIssueApiCall(url, custom_field) {

  url = userProperties.getProperty('FQDN') + url;
  var params = {
    "method":"GET",
    "headers":JSON.parse(userProperties.getProperty('AUTH_HEADER'))
  };  
  
  var response = UrlFetchApp.fetch(url, params);
  var json = response.getContentText();

  var data = JSON.parse(json);

  var headerArray = Object.keys(data["issue"]["custom_fields"][0]);
  var resultArray = [];
  
  var subArray = [];
  for (var j in data["issue"]["custom_fields"]) {
    if (data["issue"]["custom_fields"][j]["name"] == custom_field) {
      subArray.push(data["issue"]["custom_fields"][j]["value"]);
    }
  }
  resultArray.push(subArray);

  return resultArray;
}


function cesRdm_Users() {
  var data = cesRdmApiCall(cesRdmUsersUrl + "?", "users");
  
  return data;
}

function cesRdm_Projects() {
  var data = cesRdmApiCall(cesRdmProjectsUrl + "?", "projects");
  
  return data;
}

function cesRdm_Memberships(project) {
  
  if (project != null && project != "") {
    var url = cesRdmMembershipsUrl.replace("%%project%%", project) + "?";
    var data = cesRdmApiCall(url, "memberships");
     
    return data;
  } else {
   return("Please choose a project identifier"); 
  }
}

function cesRdm_Issues(project) {
  
  if (project != null && project != "") {
    var url = cesRdmIssuesUrl.replace("%%project%%", project) + "?";
    var data = cesRdmApiCall(url, "issues");
     
    return data;
  } else {
   return("Please choose a project identifier"); 
  }
}

function cesRdm_Issue(issue) {
  
  if (issue != null && issue != "") {
    var url = cesRdmIssueUrl.replace("%%issue%%", issue) + "?";
    var data = cesRdmIssueApiCall(url, "issue");
     
    return data;
  } else {
   return("Please choose an issue id"); 
  }
}

function cesRdm_CFIssue(issue, custom_field) {
  
  if (issue != null && issue != "" && custom_field != null && custom_field != "") {
    var url = cesRdmIssueUrl.replace("%%issue%%", issue) + "?";
    var data = cesRdmCFIssueApiCall(url, custom_field);
    return data;
  } else {
   return("Please choose an issue id and custom field name"); 
  }
}

function cesRdm_TimeEntries(project, from, to) {

  var date = new Date();                  
  
  if (from == null || from == "") {
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1); 
    from = [firstDay.getFullYear() + "-",
          (firstDay.getMonth()>9 ? '' : '0') + firstDay.getMonth() + "-",
          (firstDay.getDate()>9 ? '' : '0') + firstDay.getDate()
         ].join('');
  }

  if (to == null || to == "") {
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    to = [lastDay.getFullYear() + "-",
          (lastDay.getMonth()>9 ? '' : '0') + lastDay.getMonth() + "-",
          (lastDay.getDate()>9 ? '' : '0') + lastDay.getDate()
         ].join('');
  }
  
  if (project != null && project != "") {
    var url = cesRdmTimeEntriesUrl.replace("%%project%%", project) + "?from=" + from + "&to=" + to + "&";
    var data = cesRdmApiCall(url, "time_entries");
  
    return data;
  } else {
   return("Please choose a project identifier"); 
  }
}

function cesRdm_Versions(project) {

  if (project != null && project != "") {
    var url = cesRdmVersionsUrl.replace("%%project%%", project) + "?";
    var data = cesRdmApiCall(url, "versions");
  
    return data;
  } else {
   return("Please choose a project identifier"); 
  }

}
