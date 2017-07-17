
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
  //Utility.applyConditionalFormatting(e);
  
  ForecastingMethodologies.onEdit(e);

  //protected values in the ranges store in firebase  
  //protected formulas and Backgruond color in the ranges store in firebase
  //ProtectFormulas.checkIfValueIsNotProtected(e);
  //ProtectionMaker.checkIfValueIsNotProtected(e);
  
  //rebuild Style form current column
  ProtectionMaker.checkIfValueIsNotProtected(e);
  //rebuild the formulas for current column
  ForecastUtility.checkIfValueIsNotProtected(e);
  
  //rebuild conditional formatting
  Utility.applyConditionalFormatting(e);
  
  //protect the sheet
  ProtectRanges.checkIfValueIsNotProtected(e);
  //it set the last date when updating particular column (data entry column)  
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
    //ProtectFormulas.protectCell(userToken);
    LastDateUpdater.protectCell(userToken);
    //ProtectionMaker.protectCell(userToken);
    
    //store the rules for new formulas
    ForecastUtility.protectCell(userToken);
  }
  
}
