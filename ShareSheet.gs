var ShareSheet=new function(){

  /**
   * get the countryAccount node from firebase
   * @param  {string} userToken the token
   * @return {object}           the object representing the node
   */
  this.getCountryAccounts=function(userToken){
      var countryAccounts={};

      countryAccounts=APPCache.get("countryAccounts");

      if (countryAccounts) {
          return countryAccounts;
      }

      countryAccounts=FirebaseConnector.getFireBaseDataParsed('/config/countryAccount', userToken);

      APPCache.put("countryAccounts", countryAccounts);

      return countryAccounts;
  };


  /**
   * check if an account is in the countryAccount fb node
   * @param  {string} account   the email of the Account
   * @param  {string} userToken the token
   * @return {bool}           true if found, false otherwise
   */
  this.isInCountryAccount=function(account, userToken){
      var countryAccounts;

      if (!account || !userToken) {
          throw "InvalidArgument";
      }

      countryAccounts=this.getCountryAccounts();


      for (var country in countryAccounts) {
          if (countryAccounts.hasOwnProperty(country) && (countryAccounts[country]===account)) {
              return true;
          }
      }

      return false;
  };



  //---------------------------------------------------------
  /**
  * CREATE A NEW GOOGLE SHEET
  * @param  {string} name of the new file
  * @param  {string} google account of the country (email address)
  */
  //---------------------------------------------------------
  this.createSheet=function(countryName,countryAccount,userToken) {

    //datanode from firebase
    var countryRegisterNode = 'config/countryRegister/'+ countryName;
    var excelExportSheetId, newFileId;

    //retrive the country google sheet id stored
    var countryRegister = JSON.parse(FirebaseConnector.getFireBaseData(countryRegisterNode,userToken));

    //if country google sheet id its FALSE... we have to create a google sheet for the country selected
    if(countryRegister ==='false'){
      var newFile = ShareSheet.cloneSheet(countryName);
      newFileId=newFile.getId();

	  ShareSheet.storeSheetId(countryName, newFileId, userToken)

	  ShareSheet.shareSheet(newFile,countryAccount, userToken);

      //empty the template
      MasterUtility.writeNoteAndDataForCountriesMaster(countryName,true);

      //create an empty spreadsheet for the excel exportation
      excelExportSheetId=ExcelExport.createExportSheet(Utility.ucfirst(countryName));

      ExcelExport.storeExportSheetId(newFileId, excelExportSheetId,userToken);

      Utility.toastInfo('Sheet created', 'Sheet created and shared');

    }else{
      //if it ALREADY EXISTS we simply have to share the existing google sheet

      try {
        //retrive the existing file
        var existingFileToBeShared = DriveApp.getFileById(countryRegister);
        ShareSheet.shareSheet(existingFileToBeShared,countryAccount, userToken);

        //empty the template
        MasterUtility.writeNoteAndDataForCountriesMaster(countryName,true)

        //finish operation
        Utility.toastInfo('Sheet shared', 'Sheet shared');
      }
      catch(err) {
        //empty the template
        MasterUtility.writeNoteAndDataForCountriesMaster(countryName,true)

        //FAIL operation
        Utility.toastInfo('Share Failed', 'The file could be deleted');
      }

    }


  }
  //---------------------------------------------------------
  // END  CREATE A NEW GOOGLE SHEET
  //---------------------------------------------------------


  /**
	 * CLONE THE MASTER TEMPLATE
	 * @param  {string} countryName google account of the country (email address)
	 * @return  {file} the new sheet
	 */
  this.cloneSheet = function(countryName){
	  //get current folder id
	  var ss = SpreadsheetApp.getActive(); //current spreadsheet

	  //get current file master file to be cloned
	  var file = DriveApp.getFileById(ss.getId());

      var filename=Utility.interpolate(Config.nationalSheetFilename, {
          country:Utility.ucfirst(countryName)
      });

	  return file.makeCopy(filename);
  };


  //---------------------------------------------------------
  /**
	 * SHARE SHEET
     * @param  {file} the new file cloned
     * @param  {string} google account of the country (email address)
     * @param  {string} userToken the token
 	 */
  //---------------------------------------------------------
  this.shareSheet= function(newfile,countryAccount, userToken) {

	  //share the new country sheet
	  newfile.addEditor(countryAccount);

      if(ShareSheet.isInCountryAccount(countryAccount,userToken)){
          newfile.addEditor(Config.secretariatAccount);
      }

      if (!Config.devMode) {
    	  DriveApp.getFileById(Config.amisMarketAppId).addViewer(countryAccount);
    	  DriveApp.getFileById(Config.amisLibId).addViewer(countryAccount);
      }

	  //my version of AMIS MARKET APP API
      //DriveApp.getFileById('1hxYNjnVdM7hSmjvaJeoiRV6EQuZki-7c1mHkOQ-USat5uUwOL3uc26EI').addViewer(countryAccount);
  }
  //---------------------------------------------------------
  // END -- SHARE SHEET
  //---------------------------------------------------------

  this.storeSheetId = function (countryName, fileId, userToken){
	  var data={
		  "name":countryName,
		  "dataSheetNode":countryName+'Data'
	  }

	  //path of the new country
	  var saveNode= 'config/countries/'+fileId;
	  //write sheetId into firebase
	  FirebaseConnector.writeOnFirebase(data, saveNode,userToken);

	  //update the country register --- if FALSE means that for a country has not been created and share the sheet
	  FirebaseConnector.writeOnFirebase(fileId,'config/countryRegister/'+countryName,userToken);

  }

}
