class FileUtility {
  constructor(file) {
    this.id = file.id;
    this.displayType = file.displayType;
    this.mimeType = file.mimeType;
    this.size = file.size;
    this.title = file.title;
    this.uri = file.uri;
    this.url = file.url;
    this.permissions = window.cordova.plugins.permissions;
    this.fileOpener = window.cordova.plugins.fileOpener2;
    this.fileTransfer = new window.FileTransfer();
    this.externalDownloadDir = window.cordova.file.externalRootDirectory;
    this.storageType = "PERSISTENT";
    this.fileEntry = null;
  }

  getEncodedUri() {
    return encodeURI(decodeURIComponent(this.url));
  }

  fail(error) {
    console.log(error);
    return null;
  }

  tryPermission(permission, successFn) {
    return this.permissions.checkPermission(permission, successFn, this.fail);
  }

  requestFs(systemType = this.storageType, successFn) {
    return window.requestFileSystem(
      LocalFileSystem[systemType],
      0,
      successFn,
      this.fail
    );
  }

  async ifFileExists() {
    const readPermissions = await this.permissionGate("READ_EXTERNAL_STORAGE");
    if (readPermissions.hasPermission) {
      window.requestFileSystem(
        this.externalDownloadDir,
        dirEntry => {
          dirEntry.getFile(
            this.title,
            { create: false },
            fileEntry => {
              return fileEntry;
            },
            this.fail
          );
        },
        this.fail
      );
    }
  }

  download(successFn) {
    const filePathFull = this.externalDownloadDir + "Download/" + this.title;
    const encodedUri = this.getEncodedUri();

    this.fileTransfer.download(encodedUri, filePathFull, successFn, this.fail);
  }

  inquirePermission(neededPermission, successFn) {
    const permissionName = this.permissions[neededPermission];
    return this.permissions.requestPermission(
      permissionName,
      successFn,
      this.fail
    );
  }

  async openFile(fileEntry) {
    let entry = null;
    this.fileOpener.open(fileEntry.nativeURL, this.mimeType, {
      error: this.fail,
      success: fileEntry => {
        //  return fileEntry;
        entry = fileEntry;
      }
    });
    return entry;
  }

  async permissionGate(neededPermission) {
    return new Promise((resolve, reject) => {
      this.tryPermission(neededPermission, status => {
        if (status.hasPermission) {
          resolve(status);
        } else {
          this.inquirePermission(neededPermission, status => {
            if (status.hasPermission) {
              resolve(status);
            } else {
              reject(status);
            }
          });
        }
      });
    });
  }
  async requestAndDownload() {
    return new Promise((resolve, reject) => {
      this.requestFs(
        this.storageType,
        this.download(entry => {
          console.log(entry);
          this.fileEntry = entry;
          if (entry) {
            resolve(entry);
          } else {
            reject(entry);
          }
        })
      );
    });
  }
}

async function uploadFile() {
  const selectFile = () => {
    var htmlContent = "";
    var appendContent = "",
      localURLs = [
        cordova.file.documentsDirectory,
        cordova.file.externalRootDirectory,
        cordova.file.sharedDirectory,
        cordova.file.syncedDataDirectory
      ];

    var directoriesLooped = localURLs.length;

    const addFileRecursively = entry => {
        var dirReader = entry.createReader();
        dirReader.readEntries(
          function(entries) {
            for (let i = 0; i < entries.length; i++) {
              if (entries[i].isDirectory) {
                appendContent += `<div class="isDirectory>Directory" ${entries[i].fullPath}</div>`;
                directoriesLooped += 1;
                addFileRecursively(entries[i]);
              } else {
                appendContent += `<div class="isFile">File ${entries[i].fullPath}</div>`;
              }
            }

            directoriesLooped -= 1;
            if (directoriesLooped <= 0) {
              if (appendContent.length > 0) {
                htmlContent = appendContent;
              } else {
                htmlContent = "No documents found";
              }
            }
          },
          function(error) {
            console.log("readEntries error: " + error.code);
            contents += "<p>readEntries error: " + error.code + "</p>";
          }
        );
      },
      addError = function(error) {
        // log the error and continue processing
        console.log("getDirectory error: " + error.code);
        DirsRemaining -= 1;
      };
    for (i = 0; i < localURLs.length; i += 1) {
      if (localURLs[i] === null || localURLs[i].length === 0) {
        DirsRemaining -= 1;
        continue; // skip blank / non-existent paths for this platform
      }
      window.resolveLocalFileSystemURL(
        localURLs[i],
        addFileRecursively,
        addError
      );
    }
  };
}

async function openByFileEntry(file, fileEntry) {
  let fileOpenEntry = null;
  const fileUtility = new FileUtility(file);
  const readPermissions = await fileUtility.permissionGate(
    "READ_EXTERNAL_STORAGE"
  );

  if (readPermissions) {
    fileOpenEntry = fileEntry;
    const fileOpenedEntry = await fileUtility.openFile(fileEntry);
  }
  return fileOpenEntry;
}

async function downloadFile(file) {
  console.log(file);
  let fileEntry = null;
  const fileUtility = new FileUtility(file);
  const writePermissions = await fileUtility.permissionGate(
    "WRITE_EXTERNAL_STORAGE"
  );

  if (writePermissions) {
    fileEntry = await fileUtility.requestAndDownload();
  }

  return fileEntry;
}

/* var camearaOptions = {
  quality: 100,
  destinationType: navigator.camera.DestinationType.FILE_URI,
  sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
};
 */
function getImage() {
  if (window && window.cordova)
    navigator.camera.getPicture(uploadPhoto, onError, camearaOptions);
}

function onError(err) {
  alert(error);
}

function uploadPhoto(imageURI) {
  var options = new FileUploadOptions();
  options.fileKey = "file";
  options.fileName = imageURI.substr(imageURI.lastIndexOf("/") + 1);
  options.mimeType = "image/jpeg";

  var ft = new FileTransfer();
  return;

}

export { downloadFile, openByFileEntry, uploadFile, getImage, FileUtility };
