var cesScmRepositoriesUrl = "/scm/api/rest/repositories";
var cesScmPluginsUrl = "/scm/api/rest/plugins";

function cesScmApiCall(url) {

  url = userProperties.getProperty('FQDN') + url;
  var params = {
    "method":"GET",
    "headers":JSON.parse(userProperties.getProperty('AUTH_HEADER'))
  };  
  
  try {
     var response = UrlFetchApp.fetch(url, params);
  }
  catch(err) {
    return "ERROR: " + err.message;
  }
  
  var json = response.getContentText();
  var data = JSON.parse(json);

  var headerArray = Object.keys(data[0]);
  var resultArray = [headerArray];
  
  for (var i in data) {
    var subArray = [];
    for (var j in headerArray) {
      subArray.push(data[i][headerArray[j]]);
    }
    resultArray.push(subArray);
  }

  return resultArray;

}

function cesScm_Repositories(id) {
  var url = cesScmRepositoriesUrl;
  
  if (id != null && id != "") {
    return "Not yet implemented."
    url = url + "/" + id;
  }
  
  var data = cesScmApiCall(url);
  
  return data;
}

function cesScm_Plugins(filter) {
  var url = cesScmPluginsUrl;
  
  if (filter != null && filter != "") {

    if (filter == "available" || filter == "installed" || filter == "overview" || filter == "updates") {
      
      url = url + "/" + filter; 
      
    } else {
      
      return "ERROR: Unknown filter. Allowed values are available, installed, overview and updates";
    }
  }
  
  var data = cesScmApiCall(url);
  
  return data;
}
