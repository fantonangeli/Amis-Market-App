/**
 * app configuration
 * @type {Object}
 */
var Config={
	/**
	 * dbName on firebase
	 * @type {String}
	 */
	dbName:"amis-market-antonangeli",

	/**
	 * apiKey on firebase
	 * @type {String}
	 */
	apiKey: "AIzaSyCSkTNjFVSnnN3qeZMeqLvxiV2sHzEp4bE",

	/**
	 * spreadsheet config
	 * @type {Object}
	 */
	Sheet:{
		countryCell:"B1",
		datasourceCell:"B3",
        commodityCell: "B2"
	},

	/**
	 * developer mode
	 * @type {bool}
	 */
	devMode:true,

	/**
	 * email address for errors informations
	 * @type {String}
	 */
	errorEmail:"amis.outlook.fao@gmail.com",

	/**
	 * the keyword to recognize the master spreadsheet by the filename
	 * @type {String}
	 */
	masterKeyword:"MASTER",

	/**
	 * the keyword to recognize the template spreadsheet by the filename
	 * @type {String}
	 */
	templatePrefix:"Template_"

};
