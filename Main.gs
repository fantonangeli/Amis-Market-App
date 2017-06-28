
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
  //it set the last date when updating particular column (data entry column)
  //Utility.onEditSetLastUpdateDate(e);



  ForecastingMethodologies.onEdit(e);
  
  //it set the last date when updating particular column (data entry column)
  //Utility.onEditSetLastUpdateDate(e);
  LastDateUpdater.onEditSetLastUpdateDate(FirebaseConnector.getToken(),e);
  
  //ForecastingMethodologies.onEdit(e);   
  //ProtectRanges.checkIfValueIsNotProtected(e);
  //ProtectFormulas.checkIfValueIsNotProtected(e);
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
    
}