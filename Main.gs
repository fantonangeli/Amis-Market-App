
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
  
  //
  ForecastingMethodologies.onEdit(e);
  
  //set the last date on edit event
  LastDateUpdater.onEditSetLastUpdateDate(FirebaseConnector.getToken(),e);
  
}

/**
 * onLogin  event
 */
function onLogin(){
    if (Utility.isMaster()) {
      return;
    }

    ForecastingMethodologies.getConfig(true);
}

/**
 * protect sheet event
 */
function protectSheet(userToken){
  userToken = userToken ? userToken : FirebaseConnector.getToken();
  if(userToken){
    
    //store the ranges to be protected
    ProtectRanges.protectCell(userToken);
    
    //store the ranges where not apply rebuild style, formulas , conditional formatting
    ProtectFormulas.protectCell(userToken);
    
    //store the last row update label position
    LastDateUpdater.protectCell(userToken);
    
    //
    ProtectionMaker.protectCell(userToken);
    
    //store the rules for new formulas
    ForecastUtility.protectCell(userToken);
  }

}
