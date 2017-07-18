
function onOpen() {
  FirebaseConnector.setToken("");

  //create Amis menu
  Utility.createAmisMenu();
  
  //alert for amis menu
  Browser.msgBox('To Open AMIS click on "AMIS" in the menu');

  //create Amis sidebar
  //Utility.openSidebar();
}



function openSidebar(){
  //create sidebar
  Utility.openSidebar();
}

function onEdit(e){
  
  //this restore the styles and the formatting condition if necessary
  ProtectFormulas.checkIfValueIsNotProtected(e);
  
  //this restore old values of protected areas
  ProtectRanges.checkIfValueIsNotProtected(e);
  
  ForecastingMethodologies.onEdit(e);
  
  LastDateUpdater.onEditSetLastUpdateDate(FirebaseConnector.getToken(),e);
  
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
  userToken = userToken ? userToken : FirebaseConnector.getToken();
  if(userToken){
    
    ProtectRanges.protectCell(userToken);
    
    ProtectFormulas.protectCell(userToken);
    
    LastDateUpdater.protectCell(userToken);
    
    //ProtectionMaker.protectCell(userToken);
    
    //store the rules for new formulas
    ForecastUtility.protectCell(userToken);
  }
  
}
