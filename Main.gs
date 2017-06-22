/**
 * firebase token
 * @type {string}
 */
this.tokenFireBase=null;


function onOpen() {

  //create Amis menu
  Utility.createAmisMenu();

  //create Amis sidebar
  Utility.openSidebar();

}



function openSidebar(){
  //create sidebar
  Utility.openSidebar();

}

function onEdit(e){
  //it set the last date when updating particular column (data entry column)
  //Utility.onEditSetLastUpdateDate(e);



  ForecastingMethodologies.onEdit(e);
}

/**
 * setter for the firebase token
 * @param  {string} token
 */
function setTokenFireBase(token) {
  this.tokenFireBase = token;
}
