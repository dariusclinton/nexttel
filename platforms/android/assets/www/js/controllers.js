angular.module('nexttel.controllers', [])

.controller('InformationsCtrl', function($scope, $rootScope) {

  $rootScope.user = {civilite: 'M'};

  $scope.scannerCode = function() {
     cordova.plugins.barcodeScanner.scan(
      function (result) {
          alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
      }, 
      function (error) {
          alert("Scanning failed: " + error);
      },
      {
          "showFlipCameraButton" : true, // iOS and Android
          "prompt" : "Placer le codebar dans la zone de scan", // supported on Android only
          // "formats" : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      }
   );
  }

})

.controller('PhotosCtrl', function($scope, $cordovaCamera, $cordovaFile, $rootScope) {

    var images = {};

    // Options de la camera
    var options = {
        quality: 90,
        destinationType: Camera.DestinationType.FILE_URL,
        sourceType: Camera.PictureSourceType.CAMERA,  // Camera.PictureSourceType.PHOTOLIBRARY
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
      };

    $scope.takePhoto1 = function() {

      $cordovaCamera.getPicture(options).then(function(imageURI) {
        // $rootScope.user.photo1 = "data:image/jpeg;base64," + imageData;
        $rootScope.user.photo1 = imageURI;

        images.image1 = imageURI;

      }, function(err) {
        alert("Erreur de capture.");
      });
    }

    $scope.takePhoto2 = function() {
      
      $cordovaCamera.getPicture(options).then(function(imageURI) {
        // $rootScope.user.photo2 = "data:image/jpeg;base64," + imageData;
        $rootScope.user.photo2 = imageURI;

        images.image2 = imageURI;

      }, function(err) {
        alert("Erreur de capture.");
      });
    }

    $scope.enregistrer = function(user) {
      var numero = 0;

      onImageSuccess(images.image1);

      onImageSuccess(images.image2);

      function onImageSuccess(fileURI) {
        createFileEntry(fileURI);
      }
     
      function createFileEntry(fileURI) {
        window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
      }
   
      // 5
      function copyFile(fileEntry) {
        numero++;
        // alert("numCNI = " + user.numCNI +" _ "+numero);
        // var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
        var newName = ' '+ user.numTelephone + '_' + numero + '.' + 'jpg';
        alert(newName);
   
        window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function(fileSystem2) {
          fileEntry.copyTo(
            fileSystem2,
            newName,
            onCopySuccess,
            fail
          );
        },
        fail);
      }
      
      // 6
      function onCopySuccess(entry) {
        alert("Image saved successfully!!");
      }
   
      function fail(error) {
        alert("fail: " + error.code);
      }

      // Creation du repertoire s'il n'existe pas
      window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function (rootDirEntry) {
          rootDirEntry.getDirectory('nexttel', { create: true }, function (dirEntry) {

          }, onErrorGetDir);
      }, onErrorLoadFs);
      
      // Creation du fichier s'il n'existe pas et ecriture
      window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function (dirEntry) {

          alert('file system open: ' + dirEntry.name);
          var isAppend = true;
          createFile(dirEntry, "nexttel/Utilisateurs.txt", isAppend);

      }, onErrorLoadFs);


      function createFile(dirEntry, fileName, isAppend) {
        // Creates a new file or returns the file if it already exists.
          dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
            
            var data = getData(user);
            writeFile(fileEntry, data, isAppend);

          }, onErrorCreateFile);
      }

      function writeFile(fileEntry, dataObj, isAppend) {
          // Create a FileWriter object for our FileEntry (log.txt).
          fileEntry.createWriter(function (fileWriter) {

              fileWriter.onwriteend = function() {
                  alert("Utilisateur enregistré!!!");
                  // readFile(fileEntry);
              };

              fileWriter.onerror = function (e) {
                  alert("Failed file read: " + e.toString());
              };

              // If we are appending data to file, go to the end of the file.
              if (isAppend) {
                  try {
                      fileWriter.seek(fileWriter.length);
                  }
                  catch (e) {
                      alert("file doesn't exist!");
                  }
              }
              fileWriter.write(dataObj);
          });
      }

      function onErrorLoadFs() {
        alert('Erreur du chargement du file system.');
      }
      
      function onErrorCreateFile() {
        alert('Erreur de création du fichier.');
      }

      function onErrorGetDir() {
        alert('Erreur de création du répertoire.');
      }

      // Reinitialisation de la variable user
      $rootScope.user = {};
      images = {};
    }

});

function getData(user) {
  return user.numTelephone + ' # ' + user.numCNI + ' # ' + user.dateDelivrance + ' # ' +
          user.dateExpiration + ' # ' + user.lieuDelivrance + ' # ' + user.nationnalite + ' # ' +
          user.civilite + ' # ' + user.nom + ' # ' + user.prenoms + ' # ' + user.dateNaissance + ' # ' +
          user.lieuNaissance + ' # ' + user.ville + ' # ' + user.quartier + '\n';
}