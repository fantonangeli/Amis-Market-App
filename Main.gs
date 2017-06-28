
function onOpen() {
  FirebaseConnector.setToken("");

  //alert for amis menu
  Browser.msgBox('Please CLICK ON AMIS MENU from the top menu');
  
  //create Amis menu
  Utility.createAmisMenu();

  //create Amis sidebar
  //Utility.openSidebar();       
}



function openSidebar(){
  //create sidebar
  Utility.openSidebar();  
}

function onEdit(e){

  ForecastingMethodologies.onEdit(e);
  
  //it set the last date when updating particular column (data entry column)
  LastDateUpdater.onEditSetLastUpdateDate(FirebaseConnector.getToken(),e);
  
  //protected values in the ranges store in firebase
  ProtectRanges.checkIfValueIsNotProtected(e);
  //protected formulas and Backgruond color in the ranges store in firebase
  ProtectFormulas.checkIfValueIsNotProtected(e);
}

/**
 * onLogin  event
 */
function onLogin(){
    ForecastingMethodologies.getConfig(true);
}

/**
 * protect sheet event
 */
function protectSheet(userToken){
	ProtectRanges.protectCell(userToken);          
    ProtectFormulas.protectCell(userToken);
    LastDateUpdater.protectCell(userToken);
}