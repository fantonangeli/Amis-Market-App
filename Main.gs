
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

  ForecastingMethodologies.onEdit(e);

  //it set the last date when updating particular column (data entry column)
  LastDateUpdater.onEditSetLastUpdateDate(FirebaseConnector.getToken(),e);

  //protected values in the ranges store in firebase
  ProtectRanges.checkIfValueIsNotProtected(e);
  //protected formulas and Backgruond color in the ranges store in firebase
  ProtectFormulas.checkIfValueIsNotProtected(e);

  if(!FirebaseConnector.getToken()){
      ProtectSheet.onEdit();
  }

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
