var ShareSheet=new function(){


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

    //retrive the country google sheet id stored
    var countryRegister = JSON.parse(FirebaseConnector.getFireBaseData(countryRegisterNode,userToken));

    //if country google sheet id its FALSE... we have to create a google sheet for the country selected
    if(countryRegister ==='false'){
      var newFile = ShareSheet.cloneSheet(countryName);

	  ShareSheet.storeSheetId(countryName, newFile.getId(), userToken)

	  ShareSheet.shareSheet(newFile,countryAccount);

      //empty the template
      MasterUtility.writeNoteAndDataForCountriesMaster(countryName,true)


      Utility.toastInfo('Sheet created', 'Sheet created and shared');

    }else{
      //if it ALREADY EXISTS we simply have to share the existing google sheet

      try {
        //retrive the existing file
        var existingFileToBeShared = DriveApp.getFileById(countryRegister);
        ShareSheet.shareSheet(existingFileToBeShared,countryAccount);

        //empty the template
        MasterUtility.writeNoteAndDataForCountries(countryName,true)

        //finish operation
        Utility.toastInfo('Sheet created', 'Sheet created and shared');
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


  //---------------------------------------------------------
  /**
	 * CLONE THE MASTER TEMPLATE
	 * @param  {string} google account of the country (email address)
	 * @return  {file} the new sheet
	 */
  //---------------------------------------------------------
  this.cloneSheet = function(countryName){
	  //get current folder id
	  var ss = SpreadsheetApp.getActive(); //current spreadsheet

	  //get current file master file to be cloned
	  var file = DriveApp.getFileById(ss.getId());

	  return file.makeCopy(countryName+ ' National');
  }
  //---------------------------------------------------------
  // END -- CLONE THE MASTER TEMPLATE
  //---------------------------------------------------------


  //---------------------------------------------------------
  /**
	 * SHARE SHEET
     * @param  {file} the new file cloned
     * @param  {string} google account of the country (email address)
	 */
  //---------------------------------------------------------
  this.shareSheet= function(newfile,countryAccount) {

	  //share the new country sheet
	  newfile.addEditor(countryAccount);

	  DriveApp.getFileById(Config.amisMarketAppId).addViewer(countryAccount);
	  DriveApp.getFileById(Config.amisLibId).addViewer(countryAccount);

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
