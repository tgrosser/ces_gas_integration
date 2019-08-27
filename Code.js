/**
 * A special function that runs when the spreadsheet is open, used to add a
 * custom menu to the spreadsheet.
*/

var userProperties = PropertiesService.getUserProperties();

function onOpen() {
  var spreadsheet = SpreadsheetApp.getActive();
  if (userProperties.getProperty("AUTH_HEADER") == null || userProperties.getProperty("AUTH_HEADER") == "") {
    var menuItems = [
      {name: "Login", functionName: "showLogin"},
    ];      
  } else {
    var menuItems = [
      {name: userProperties.getProperty("USERNAME") + " - Logout", functionName: "executeLogout"},
    ];            
    menuItems.push({name: "Redmine - Users", functionName: "showRedmineUsers"})
    menuItems.push({name: "Redmine - Projects", functionName: "showRedmineProjects"})
    menuItems.push({name: "SCM-Manager - Repositories", functionName: "showSCMRepositories"})
  }
    
  menuItems.push({name: "Help", functionName: "showHelp"})
  spreadsheet.addMenu("Cloudogu EcoSystem", menuItems);
}
    
function ces_authenticate(promptFqdn, promptUsername, promptPassword) {
  
  var auth_header = {
    "Authorization" : "Basic " + Utilities.base64Encode(promptUsername + ':' + promptPassword)
  };

  userProperties.setProperty("AUTH_HEADER", JSON.stringify(auth_header));
  userProperties.setProperty("USERNAME", promptUsername);
  userProperties.setProperty("FQDN", promptFqdn);
  
  onOpen();
  
  // TODO: Check credentials
  return promptUsername;
}

function showLogin() {
  var html = HtmlService.createHtmlOutputFromFile('login').setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(html, 'Please enter your credentials');
}

function executeLogout() {
  auth_header = "";
  userProperties.setProperty('AUTH_HEADER', "");
  userProperties.setProperty('USERNAME', "");
  userProperties.setProperty('FQDN', "");

  onOpen();
}

function ces_Help(dogu) {
  
  var resultArray = [["dogu", "function", "return value", "parameter name", "mandatory?", "parameter description"]];
  resultArray.push(["", "ces_help(dogu)", "a table of all functions or functions for the selected dogu", "dogu", "no", "a valid dogu name"]);

  resultArray.push(["", "", "", "", "", ""]);

  if ((dogu != null && dogu != "" && dogu == "redmine") || dogu == null || dogu == "") {
    
    resultArray.push(["redmine", "cesrdm_users()", "a table of redmine users", "", "", ""]);
    resultArray.push(["redmine", "cesrdm_projects()", "a table of redmine projects", "", "", ""]);
    resultArray.push(["redmine", "cesrdm_memberships(project)", "a table of members of the selected project", "project", "yes", "a valid project identifier"]);
    resultArray.push(["redmine", "cesrdm_issues(project)", "a table of issues of the selected project", "project", "yes", "a valid project identifier"]);
    resultArray.push(["redmine", "cesrdm_issue(issue)", "a table with details of the selected issue", "issue", "yes", "a valid issue id"]);
    resultArray.push(["redmine", "cesrdm_timeentries(project, from, to)", "a table with time entries of the selected project", "project", "yes", "a valid project identifier"]);
    resultArray.push(["", "", "", "from", "no", "a from date (yyyy-mm-dd) default is the first day of the previous month"]);
    resultArray.push(["", "", "", "to", "no", "a to date (yyyy-mm-dd) default is the last day of the previous month"]);
    resultArray.push(["redmine", "cesrdm_versions(project)", "a table with versions of the selected project", "project", "yes", "a valid project identifier"]);
    resultArray.push(["redmine", "cesrdm_cfissue(issue, custom_field)", "the value of the named custom field for the selected issue", "issue", "yes", "a valid issue id"]);
    resultArray.push(["", "", "", "custom field", "yes", "a valid custom field name for the selected issue"]);

    resultArray.push(["", "", "", "", "", ""]);
    
  } 
  
  if ((dogu != null && dogu != "" && dogu == "scm") || dogu == null || dogu == "") {
    
    resultArray.push(["scm", "cesscm_repositories(repository)", "a table of repositories or details of a selected repository", "repository", "no", "a valid repository identifier"]);

    resultArray.push(["", "", "", "", "", ""]);
  }
  
  return resultArray;
}

function showHelp() {

  var spreadsheet = SpreadsheetApp.getActive();
  
  var sheetName = "Help";
  var helpSheet = spreadsheet.getSheetByName(sheetName);
  if (helpSheet) {
    helpSheet.clear();
    helpSheet.activate();
  } else {
    helpSheet = spreadsheet.insertSheet(sheetName, spreadsheet.getNumSheets());
  }
  
  var helpArray = ces_Help();
  helpSheet.getRange(2, 1, helpArray.length, 6).setValues(helpArray);
  
  // Format the new sheet.
  helpSheet.getRange('A2:F2').setFontWeight('bold');
  helpSheet.setColumnWidth(1, 60);
  helpSheet.setColumnWidth(2, 260);
  helpSheet.setColumnWidth(3, 360);
  helpSheet.setColumnWidth(4, 80);
  helpSheet.setColumnWidth(5, 50);
  helpSheet.setColumnWidth(6, 420);
  
  helpSheet.setFrozenRows(2);
  var filter = helpSheet.getRange(2, 1, helpArray.length, 6).getFilter();
  if (filter) {
    filter.remove();
  }
  helpSheet.getRange(2, 1, helpArray.length, 6).createFilter();
  
  SpreadsheetApp.flush();
  
}

function showRedmineUsers() {

  var spreadsheet = SpreadsheetApp.getActive();
  
  var sheetName = "Redmine - Users";
  var cesrdmUsersSheet = spreadsheet.getSheetByName(sheetName);
  if (cesrdmUsersSheet) {
    cesrdmUsersSheet.clear();
    cesrdmUsersSheet.activate();
  } else {
    cesrdmUsersSheet = spreadsheet.insertSheet(sheetName, spreadsheet.getNumSheets());
  }
  
  var cesrdmUsersArray = cesRdm_Users();
  cesrdmUsersSheet.getRange(2, 1, cesrdmUsersArray.length, 6).setValues(cesrdmUsersArray);

  // Format the new sheet.
  cesrdmUsersSheet.getRange('A2:G2').setFontWeight('bold');
  cesrdmUsersSheet.setColumnWidth(1, 40);
  cesrdmUsersSheet.setColumnWidth(2, 150);
  cesrdmUsersSheet.setColumnWidth(3, 150);
  cesrdmUsersSheet.setColumnWidth(4, 150);
  cesrdmUsersSheet.setColumnWidth(5, 250);
  cesrdmUsersSheet.setColumnWidth(6, 150);
  
  cesrdmUsersSheet.setFrozenRows(2);
  var filter = cesrdmUsersSheet.getRange(2, 1, cesrdmUsersArray.length, 6).getFilter();
  if (filter) {
    filter.remove();
  }
  cesrdmUsersSheet.getRange(2, 1, cesrdmUsersArray.length, 6).createFilter();
  
  SpreadsheetApp.flush();
  
}

function showRedmineProjects() {

  var spreadsheet = SpreadsheetApp.getActive();
  
  var sheetName = "Redmine - Projects";
  var cesrdmProjectsSheet = spreadsheet.getSheetByName(sheetName);
  if (cesrdmProjectsSheet) {
    cesrdmProjectsSheet.clear();
    cesrdmProjectsSheet.activate();
  } else {
    cesrdmProjectsSheet = spreadsheet.insertSheet(sheetName, spreadsheet.getNumSheets());
  }
  
  var cesrdmProjectsArray = cesRdm_Projects();
  cesrdmProjectsSheet.getRange(2, 1, cesrdmProjectsArray.length, 7).setValues(cesrdmProjectsArray);

  // Format the new sheet.
  cesrdmProjectsSheet.getRange('A2:G2').setFontWeight('bold');
  cesrdmProjectsSheet.setColumnWidth(1, 40);
  cesrdmProjectsSheet.setColumnWidth(2, 200);
  cesrdmProjectsSheet.setColumnWidth(3, 200);
  cesrdmProjectsSheet.setColumnWidth(4, 400);
  cesrdmProjectsSheet.setColumnWidth(5, 40);
  cesrdmProjectsSheet.setColumnWidth(6, 60);
  cesrdmProjectsSheet.setColumnWidth(7, 160);
  
  cesrdmProjectsSheet.setFrozenRows(2);
  var filter = cesrdmProjectsSheet.getRange(2, 1, cesrdmProjectsArray.length, 7).getFilter();
  if (filter) {
    filter.remove();
  }
  cesrdmProjectsSheet.getRange(2, 1, cesrdmProjectsArray.length, 7).createFilter();
  
  SpreadsheetApp.flush();
  
}

function showSCMRepositories() {

  var spreadsheet = SpreadsheetApp.getActive();
  
  var sheetName = "SCM-Manager - Repositories";
  var cesscmRepositoriesSheet = spreadsheet.getSheetByName(sheetName);
  if (cesscmRepositoriesSheet) {
    cesscmRepositoriesSheet.clear();
    cesscmRepositoriesSheet.activate();
  } else {
    cesscmRepositoriesSheet = spreadsheet.insertSheet(sheetName, spreadsheet.getNumSheets());
  }
  
  var cesscmRepositoriesArray = cesScm_Repositories();
  cesscmRepositoriesSheet.getRange(2, 1, cesscmRepositoriesArray.length, 10).setValues(cesscmRepositoriesArray);

  // Format the new sheet.
  cesscmRepositoriesSheet.getRange('A2:J2').setFontWeight('bold');
  cesscmRepositoriesSheet.setColumnWidth(1, 250);
  cesscmRepositoriesSheet.setColumnWidth(2, 110);
  cesscmRepositoriesSheet.setColumnWidth(3, 300);
  cesscmRepositoriesSheet.setColumnWidth(4, 100);
  cesscmRepositoriesSheet.setColumnWidth(5, 110);
  cesscmRepositoriesSheet.setColumnWidth(6, 280);
  cesscmRepositoriesSheet.setColumnWidth(7, 80);
  cesscmRepositoriesSheet.setColumnWidth(8, 80);
  cesscmRepositoriesSheet.setColumnWidth(9, 80);
  cesscmRepositoriesSheet.setColumnWidth(10, 500);
  
  cesscmRepositoriesSheet.setFrozenRows(2);
  var filter = cesscmRepositoriesSheet.getRange(2, 1, cesscmRepositoriesArray.length, 10).getFilter();
  if (filter) {
    filter.remove();
  }
  cesscmRepositoriesSheet.getRange(2, 1, cesscmRepositoriesArray.length, 10).createFilter();
  
  SpreadsheetApp.flush();
  
}