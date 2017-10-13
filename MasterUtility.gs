var MasterUtility=new function(){
  //------------------------------------------------------------------------------------------------------------------
  /**
  * write into MASTER TEMPLATE the notes/data taken from Firebase
  * @param  {string} selected country
  * @param  {string} user token
  */
  //------------------------------------------------------------------------------------------------------------------
  this.writeNoteAndDataForCountriesMaster= function(countrySelected,isReset){

    //read config from firebase
    var templateCompilerNode = 'config/templateCompiler/'+countrySelected;
    var templateCompiler = JSON.parse(FirebaseConnector.getFireBaseData(templateCompilerNode,FirebaseConnector.getToken()));

    //read config from firebase
    var valuesNode = '';
    var valuesToBeWritten = '';

    for (var values in templateCompiler) {
      valuesNode = 'config/templateCompiler/'+countrySelected+'/'+values;
      valuesToBeWritten = JSON.parse(FirebaseConnector.getFireBaseData(valuesNode,FirebaseConnector.getToken()));

      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(values);
      //get TEMPLATE sheet
      var templateSheet = Utility.getTemplateByCommodity(values);

      for (var subNode in valuesToBeWritten) {
        //contain the range
        //valuesToBeWritten[subNode][0]
        //contain the value
        //valuesToBeWritten[subNode][1]


        if(isReset){
          //delete all the data/notes. The master will be restored
          sheet.getRange(valuesToBeWritten[subNode][0]).setValue('');
          templateSheet.getRange(valuesToBeWritten[subNode][0]).setValue('');
        }else{
          //set the values from Firebase
          sheet.getRange(valuesToBeWritten[subNode][0]).setValue(valuesToBeWritten[subNode][1])
          templateSheet.getRange(valuesToBeWritten[subNode][0]).setValue(valuesToBeWritten[subNode][1]);
        }



      }

    }


};


/**
 * execute a function for each spreadsheet registered in firebase
 * @param  {Function} callback function to execute taking 5 arguments: nation (string), the spreadsheet id, spreadsheet object, index, total length
 * @return {void}
 * @throws "InvalidArgument"
 * @throws "InvalidSpreadsheet" if the spreadsheet is not accessible
 */
this.forEachSpreadsheet=function(callback){
    var countryRegister,countryRegisterNode, userToken, _currSpreadsheet, _id, _index=0, _length;

    if ( !callback) {
		throw "InvalidArgument";
	}

    //datanode from firebase
    countryRegisterNode = 'config/countryRegister';

    userToken=FirebaseConnector.getToken();

    //retrive the country google sheet id stored
    countryRegister = JSON.parse(FirebaseConnector.getFireBaseData(countryRegisterNode,userToken));

    _length=Object.keys(countryRegister).length;

    for (var _nation in countryRegister) {
        if (countryRegister.hasOwnProperty(_nation)) {
            _id=countryRegister[_nation];

          if(!_id || _id==="false"){
           continue;
          }

            _currSpreadsheet=SpreadsheetApp.openById(_id);

            if ( !_currSpreadsheet ) {
                throw "InvalidSpreadsheet";
            }

            callback(_nation, _id, _currSpreadsheet, _index, _length);
          _index++;
        }
    }

};


/**
 * update all named range from the active spreadsheet to all spreadsheet registeredi in firebase
 * @return {void}
 */
this.updateNamedRangesOfAllSpreadSheet=function(){
    var source, report="";

    source=SpreadSheetCache.getActiveSpreadsheet();

    this.forEachSpreadsheet(function(destName, destId, dest,index,length){
        Utility.copyAllNamedRanges(dest, source);

      report+=destName+" updated on "+moment().format("YYYY-MM-DD HH:mm:ss")+" id:"+destId+"\\n";

        SpreadSheetCache.getActiveSpreadsheet().toast("Updated "+destName, (index+1)+" of "+length, 30);
    });

    Browser.msgBox(
      "All Spreadsheet are updated succesfully!\\n\\n"+
      "Update report:\\n"+
      report
    );

};



};
