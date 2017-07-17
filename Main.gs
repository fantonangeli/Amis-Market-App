
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

  //this apply conditional formatting
  Utility.applyConditionalFormatting(e);

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
    ProtectRanges.protectCell(userToken);
    ProtectFormulas.protectCell(userToken);
    LastDateUpdater.protectCell(userToken);

  }

}
