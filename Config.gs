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
	 * spreadsheet config
	 * @type {Object}
	 */
	Sheet:{
		countryCell:"C1",
		datasourceCell:"C3"
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
	masterKeyword:"MASTER"

};
