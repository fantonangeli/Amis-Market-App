
function onOpen() {
  FirebaseConnector.setToken("");
  
  //create Amis menu
  Utility.createAmisMenu();
  
  //alert for amis menu
  Browser.msgBox('To Open AMIS click on "AMIS" in the menu');
  
  //create Amis sidebar
  //Utility.openSidebar();
  
  //spreadSheetCache=new SpreadSheetCache(SpreadsheetApp.getActiveSpreadsheet(), ['Maize']);
  
  // Browser.msgBox(JSON.parse(PropertiesService.getUserProperties().getProperty("tmpValues")));                                     
}


function openSidebar(){
  //create sidebar
  Utility.openSidebar();
}

function onEdit(e){
  
  //IF user is NOT editing a Template Sheet. Do normal logic.
  if( !Utility.isTemplate() ) {
    
    //protect formulas and style for all the sheets
    ProtectionMaker.checkIfValueIsNotProtected(e);
    
    //this restore the styles and the formatting condition if necessary
    //ProtectFormulas.checkIfValueIsNotProtected(e);
    
    //this restore old values of protected areas
    //ProtectRanges.checkIfValueIsNotProtected(e);
    
    //forecast methodologies on edit
    ForecastingMethodologies.onEdit(e);
    
    //set the last date on edit event
    LastDateUpdater.onEditSetLastUpdateDate(FirebaseConnector.getToken(),e); 
  }  
  
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
    
    //Need for LASTDATE UPDATER -- it set range to be protected from update date and other info
    LastDateUpdater.protectCell(userToken);
    //ProtectRanges.protectCell(userToken);
    
    //store the ranges where not apply rebuild style, formulas , conditional formatting
    //ProtectFormulas.protectCell(userToken);
    
    //store the last row update label position
   // LastDateUpdater.protectCell(userToken);
    
    //
    //ProtectionMaker.protectCell(userToken);
    
    //store the rules for new formulas
    //ForecastUtility.protectCell(userToken);
  }

}
