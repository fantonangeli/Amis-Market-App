/**
 * app configuration
 * @type {Object}
 */
var Config={
	/**
	 * dbName on firebase
	 * @type {String}
	 */
	dbName:"amis-9189b",

	/**
	 * apiKey on firebase
	 * @type {String}
	 */
	apiKey: "AIzaSyA3aklD6VK81sc6ui_vjf1IceAi_Zgtjqo",

	/**
	 *  id of AmisMarketApp
	 * @type {String}
	 */
	amisMarketAppId:"1OJQBydtovPhuO5-PwYdmzIe6977jVqcRuk3d3ZfvHCNWWWaLjpB8kLeg",

	/**
	 * AmisLib id
	 * @type {String}
	 */
	amisLibId:"1Tk72CLnrvAoLNSh1he9BBTjDpxsSjFeOTk9PPIsnAGTPhWlwG1xOyAv3",


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
	devMode:false,

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
	 * the keyword to recognize the master spreadsheet by the filename
	 * @type {String}
	 */
	secretariatKeyword:"secretariat",

	/**
	 * the keyword to recognize the template spreadsheet by the filename
	 * @type {String}
	 */
	templatePrefix:"Template_"

};
