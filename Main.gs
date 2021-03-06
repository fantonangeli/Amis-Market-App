function onOpen() {
  FirebaseConnector.setToken("");

  //create Amis menu
  Utility.createAmisMenu();

  //alert for amis menu
  if (!Config.devMode) {
  Browser.msgBox('To Open AMIS click on "AMIS" in the menu');
  }

  //read all the named ranges and put in cache
  AmisNamedRanges.getAllNamedRanges();

  //cache all cols with in each template.
  ProtectionMaker.getTmplColsWidth();
}


function openSidebar(){
  //create sidebar
  Utility.openSidebar();
}

/**
 * function called on the onEdit event
 * @param  {object} e the event
 * @return {void}
 */
function onEdit(e){
    var activeRangeA1, template, sheet;

    //IF user is NOT editing a Template Sheet. Do normal logic.
    if( !Utility.isTemplate() && !Utility.isMaster() ) {

      sheet=SpreadSheetCache.getActiveSheet();
      template=Utility.getTemplateBySheetObj(sheet);
      activeRangeA1=e.range.getA1Notation();

      if (!ProtectionMaker.validateColumnNumber(sheet, template)) {
          return;
      }

      if (!ProtectionMaker.protectWrongForecast(activeRangeA1)) {
          return;
      }


      //forecast methodologies on edit
      ForecastingMethodologies.onEdit(e);

      //set the last date on edit event
      LastDateUpdater.onEditSetLastUpdateDate(e, activeRangeA1);

      //sets the B4 cell
      SyncMasterSheet.setLastUpdate();

    }
}

/**
 * onLogin  event
 */
function onLogin(){
    if (Utility.isMaster()) {
      return;
    }

    //ForecastingMethodologies.getConfig(true);
}

/**
 * protect sheet event
 * @deprecated not used
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

    /**
     * setter for the firebase token
     * @param  {string} token
     */
   function setSecretariatCountry (chosenCountry ) {
        PropertiesService.getUserProperties().setProperty("secretariatCountry", chosenCountry);
    };

    function getSecretariatCountry(  ) {
        return PropertiesService.getUserProperties().getProperty("secretariatCountry");
    };
