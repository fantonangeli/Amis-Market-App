/**
 * app configuration
 * @type {Object}
 */
var Config={
	/**
	 * dbName on firebase
	 * @type {String}
	 */
	dbName:"",

	/**
	 * apiKey on firebase
	 * @type {String}
	 */
	apiKey: "",

	/**
	 *  id of AmisMarketApp
	 * @type {String}
	 */
	amisMarketAppId:"",

	/**
	 * AmisLib id
	 * @type {String}
	 */
	amisLibId:"",


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
	templatePrefix:"Template_",

	/**
	 * Cache expiration in seconds. The minimum is 1 second and the maximum is 21600 seconds (6 hours).
	 * @type {number}
	 */
	cacheExpirationInSeconds:600,

	/**
	 * template string to generate the filename of national shared sheets
	 * @type {String}
	 */
	nationalSheetFilename:"AMIS {{country}} National",

	/**
	 * date format for the "Last Updated row" to store in the database
	 * @type {String}
	 */
	lastUpdatedDateDBFormat:"YYYY-MM-DD",

	/**
	 * date format for the "Last Updated row" to store in the sheet (the format is written according to GAS API)
	 * @type {String}
	 */
	lastUpdatedDateSheetFormat:"dd-mmm-yyyy",
  
    /**
	 * Named range for 'add new forecast'
	 * @type {array} 
	 */
	addNewForecastNamedRange:[ ['addFrcA1','addFrcA2'],['addFrcB1','addFrcB2'] ],
  
     /**
	 * range of restoring stylesheet
	 * @type {string} 
	 */
	rangeOfRestoreSheetStyle: 'C:AE'

};
