<script>
        var hideLoading, showLoading, userToken;

       //-----------------------------------------------------------------
       // Initialize Firebase
       //-----------------------------------------------------------------
       var config = {
       	apiKey: "<?= apiKey ?>",
       	authDomain: "<?= dbName ?>.firebaseapp.com",
       	databaseURL: "https://<?= dbName ?>.firebaseio.com",
       	projectId: "<?= dbName ?>",
       	storageBucket: "<?= dbName ?>.appspot.com",
       	messagingSenderId: "924659512730"
       };
       firebase.initializeApp( config );
       //-----------------------------------------------------------------
       // END Initialize Firebase
       //-----------------------------------------------------------------


       /**
        * show the loading spinner
        */
       showLoading = function() {
         $('#loading').show();
       };

       /**
        * callBack For All google script calls
        */
       hideLoading = function() {
          $('#loading').hide();
       };

       /**
        * callback WITH PROTECTION SHEET
        */
       hideLoadingWithProtection = function() {
         //this protect the sheet and avoid script error
         google.script.run.withSuccessHandler(hideLoadingDiv).LIB_FUNC( "AmisMarketApp.protectSheet");
       };

       /**
        * hide the loading spinner
        */
       hideLoadingDiv = function() {
         $('#loading').hide();
       };




       /**
        * onLogged events
        * @param  {object} user The signed-in user info
        */
       function onLoggedState(user){
           console.log( 'user logged', user );

           //change the sidebarmenu
           //google.script.run.changeSidebar();

           //----------------------------------
           //hide form show menu logged in
           //----------------------------------
           //google.script.run.hideShow();
           firebase.database().ref('/users_data/' + user.uid).once('value').then(function(snapshot) {
             var user_data = snapshot.val();

             if(!user_data){
                 //alert("User "+user.email+" is not authorized!");
                 google.script.run.LIB_FUNC( "AmisMarketApp.Utility.popUpAlert");
                 return;
             }
             console.log('USER_DATA', user_data);

             if ( user_data.type==="admin" ) {
                 //show create country sheet
                 $( "#create-sheet-form" ).show();
             } else {
                 //show normal menu
                 $( "#userActionsDiv" ).show();
             }

             //set user name into label
             $( "#userLabel" ).text( user.email );
             $( "#loading" ).hide();

             //----------------------------------
             //END --hide form show menu logged in
             //----------------------------------

             console.info( 'user', user.uid );
             //.then is used to get the token value
             user.getToken().then( function( data ) {
                 userToken=data;

                 if ( user_data.type!="admin" ) {
                    //automatic fetch for operative users
                    showLoading();
                    verifyToken(function(){
                        google.script.run.withSuccessHandler(hideLoadingWithProtection).LIB_FUNC("AmisMarketApp.SyncMasterSheet.startFetch",data);
                    });
                 }
                 console.log( 'gettoken', data );
                 google.script.run.LIB_FUNC( "AmisMarketApp.FirebaseConnector.setToken", data );
                 // Store in session the token
                 google.script.run.LIB_FUNC( "AmisMarketApp.onLogin" );
                 //google.script.run.LIB_FUNC( "AmisMarketApp.protectSheet",data );

             } );
         });
       }

       /**
        * verify the token, refresh it  if expired then call the callback
        * @param  {Function} callback
        */
       function verifyToken(callback) {
       	firebase.auth().currentUser.getToken( /* forceRefresh */).then( function( idToken ) {
       		callback();
       	} ).catch( function( error ) {
            //refresh the token
            firebase.auth().currentUser.getToken(true).then(function(idToken) {
                console.log('refresh token ok', idToken);
                google.script.run.LIB_FUNC( "AmisMarketApp.FirebaseConnector.setToken", idToken );
                callback();
            }).catch(function(error) {
                console.log('refresh token ko', error);
            });
       	} );
       }

       /**
        * show a popup with the google login
        */
       function loginWithGoogle() {
       	var provider = new firebase.auth.GoogleAuthProvider();
       	firebase.auth().signInWithPopup( provider ).then( function( result ) {
            onLoggedState(result.user);
       	} ).catch( function( error ) {
            console.log('ERROR', error);
       		//alert("User "+error.email+" is not authorized!");
            google.script.run.LIB_FUNC( "AmisMarketApp.Utility.popUpAlert");
       		// Handle Errors here.
       		var errorCode = error.code;
       		var errorMessage = error.message;
       		// The email of the user's account used.
       		var email = error.email;
       		// The firebase.auth.AuthCredential type that was used.
       		var credential = error.credential;
       		// ...
       	} );
       }



       /**
        * not used in the code, just for use in the browser console
        */
       function logout(){
           firebase.auth().signOut()
       }




       $( document ).ready( function() {
           var unsubOnAuthStateChanged=firebase.auth().onAuthStateChanged(function(user) {
             console.log('UNSUBONAUTHSTATECHANGED');
             window.user=user;
            //  unsubOnAuthStateChanged();
             if (user) {
                 console.log('USER authenticated', user);
                onLoggedState(user);
             } else {
                loginWithGoogle();
             }
           });


           //binding SAVE function with AMIS MARKET API
           $( "#buttonSave" ).bind( "click", function() {
               showLoading();
               verifyToken(function(){
                   google.script.run.withSuccessHandler(hideLoading).LIB_FUNC( "AmisMarketApp.SyncMasterSheet.startSync", userToken );
               });
               //disable the button himself
               $( "#addFrc16" ).prop( "disabled", false );
               $( "#addFrc17" ).prop( "disabled", false );
           } );
           $( "#addFrc16" ).bind( "click", function() {
               showLoading();
               verifyToken(function(){
                   google.script.run.withSuccessHandler(hideLoadingWithProtection).LIB_FUNC( "AmisMarketApp.ForecastUtility.addForecast16_17", userToken );
               });
               //disable the button himself
               //$( "#addFrc16" ).prop( "disabled", true );
           } );
           $( "#addFrc17" ).bind( "click", function() {
               showLoading();
               verifyToken(function(){
                   google.script.run.withSuccessHandler(hideLoadingWithProtection).LIB_FUNC( "AmisMarketApp.ForecastUtility.addForecast17_18", userToken );
               });
               //disable the button himself
               //$( "#addFrc17" ).prop( "disabled", true );
           } );
           //binding FETCH function with AMIS MARKET API
           $("#buttonFetch").bind( "click", function() {
               showLoading();
               verifyToken(function(){
                   google.script.run.withSuccessHandler(hideLoading).LIB_FUNC("AmisMarketApp.SyncMasterSheet.startFetch",userToken);
               });
           });
           //bind create google sheet function
           $( "#createSheetButton" ).bind( "click", function() {
              var countryName = $( "#countryName" ).val();
              var account = $( "#account" ).val();
              //prevent redirect actions
              showLoading();
              verifyToken(function(){
                  google.script.run.withSuccessHandler( hideLoading ).LIB_FUNC( "AmisMarketApp.ShareSheet.createSheet", countryName, account, userToken );
              });
              return false;
           } );


       } )
</script>
