var FirebaseConnector=new function(){


    /**
     * setter for the firebase token
     * @param  {string} token
     */
    this.setToken = function( token ) {
      //Utilities.sleep(300);
        PropertiesService.getUserProperties().setProperty("tokenFireBase", token);
    };

    this.getToken = function(  ) {
        return PropertiesService.getUserProperties().getProperty("tokenFireBase");
    };


  //---------------------------------------------------------
  /**
	 * return firebase url to be update/fetched
	 * @param  {string} firebase node
     * @param  {string} auth token
	 */
  //---------------------------------------------------------
  this.getFirebaseUrl=function(jsonPath,userToken) {
    /*
    We then make a URL builder
    This takes in a path, and
    returns a URL that updates the data in that path
    */
    return 'https://'+Config.dbName+'.firebaseio.com/' + jsonPath + '.json?auth=' + userToken
  }
  //---------------------------------------------------------
  // END  return firebase url to be update/fetched
  //---------------------------------------------------------


  //---------------------------------------------------------
  /**
	 * write data on firebase
	 * @param  {string} data to save
     * @param  {string} firebase note where to save
     * @param  {string} auth token
	 */
  //---------------------------------------------------------
  this.writeOnFirebase = function(data,saveNode,userToken){
    var options = {
      'method': 'put',
      'contentType': 'application/json',
      'payload': JSON.stringify(data),
     'muteHttpExceptions' : true
    };

    var fireBaseUrl = this.getFirebaseUrl(saveNode,userToken);

    UrlFetchApp.fetch(fireBaseUrl, options);

  }
  //---------------------------------------------------------
  // END  write data on firebase
  //---------------------------------------------------------


  //---------------------------------------------------------
  /**
	 * fetch data from Firebase
     * @param  {string} firebase note where to fetch
     * @param  {string} auth token
     * @return {json}   data fetched
	 */
  //---------------------------------------------------------
  this.getFireBaseData= function(node,userToken) {
   var fireBaseUrl = this.getFirebaseUrl(node,userToken);
   var ft= UrlFetchApp.fetch(fireBaseUrl);
   return ft.toString();
  }
  //---------------------------------------------------------
  // END fetch data from Firebase
  //---------------------------------------------------------
  
  
  //---------------------------------------------------------
  /**
	 * fetch country name from google sheet ID
     * @param  {string} auth token
     * @return {json}   country name from google sheet id
	 */
  //---------------------------------------------------------
  this.getCountryNameFromSheet= function(userToken) {
   var sheetId= Utility.getGoogleSheetID();
   var dataBaseNodeToRead='config/countries/'+sheetId;	  
   return JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name;
  }
  //---------------------------------------------------------
  // END -- fetch country name from google sheet ID
  //---------------------------------------------------------


}
