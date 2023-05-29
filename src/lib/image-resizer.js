export default class ImageResizer {
    hasBlobConstructor = typeof Blob !== 'undefined' && (function() {
        try {
            return Boolean(new Blob());
        } catch (e) {
            return false;
        }
    })();

    hasArrayBufferViewSupport = this.hasBlobConstructor && typeof Uint8Array !== 'undefined' && (function() {
        try {
            return new Blob([new Uint8Array(100)]).size === 100;
        } catch (e) {
            return false;
        }
    })();

    hasToBlobSupport = typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.toBlob : false;

    // tslint:disable-next-line:max-line-length
    hasBlobSupport = this.hasToBlobSupport || typeof Uint8Array !== 'undefined' && typeof ArrayBuffer !== 'undefined' && typeof atob !== 'undefined';

    hasReaderSupport = typeof FileReader !== 'undefined' || typeof URL !== 'undefined';



    resize(file, maxDimensions, callback) {

        if (!file) {
            return;
        }
        if (typeof maxDimensions === 'function') {
            callback = maxDimensions;
            maxDimensions = {
                width: 640,
                height: 480
            };
        }


        /*let maxWidth = maxDimensions.width;
        let maxHeight = maxDimensions.height;*/

        if (!this.isSupported() || !file.type.match(/image.*/)) {
            callback(file, false);
            return false;
        }

        if (file.type.match(/image\/gif/)) {
            // Not attempting, could be an animated gif
            callback(file, false);
            // TODO: use https://github.com/antimatter15/whammy to convert gif to webm
            return false;
        }

        const image = new Image();
        image.addEventListener('load', () => {
            let originalWidth = image.width;
            let originalHeight = image.height;
            let requestWidth = maxDimensions.width;
            let requestHeight = maxDimensions.height;
            let noCrop = false;

            // Calculo relacion de aspecto de la imagen original y la solicitada.
            let rRel = 0;
            if (requestHeight > 0 && requestWidth > 0) {
                rRel = (requestWidth / requestHeight);
            }
            let oRel = (originalWidth / originalHeight);
            let isWide = rRel < oRel;

            if (noCrop) {
                // Determino el aspecto de la imagen original.
                if (isWide) {
                    if (originalWidth < requestWidth) {
                        requestWidth = originalWidth;
                    }
                    requestHeight = 0;
                } else {
                    if (originalHeight < requestHeight) {
                        requestHeight = originalHeight;
                    }
                    requestWidth = 0;
                }
            }

            // Calculo dimensiones
            if (requestWidth == 0 && requestHeight == 0) {
                // early exit; no need to resize
                callback(file, false);
                return;
            } else if (requestWidth === 0) {
                requestWidth = Math.round(originalWidth * (requestHeight / originalHeight));
            } else if (requestHeight === 0) {
                requestHeight = Math.round(originalHeight * (requestWidth / originalWidth));
            }


            // Calculo el las dimensiones de la imagen segun se solicita
            let srcHeight = 0;
            let srcWidth = 0;
            let srcPositionX = 0;
            let srcPositionY = 0;
            if (isWide) {
                srcHeight = requestHeight;
                srcWidth = (originalWidth / originalHeight) * srcHeight;
                srcPositionX = (requestWidth - srcWidth) / 2;
                srcPositionY = 0;
            } else {
                srcWidth = requestWidth;
                srcHeight = (originalHeight / originalWidth) * srcWidth;
                srcPositionX = 0;
                srcPositionY = (requestHeight - srcHeight) / 5;
            }

            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');

            canvas.height = requestHeight;
            canvas.width = requestWidth;

            /*ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
             0, 0, canvas.width, canvas.height);*/

            ctx.drawImage(image, srcPositionX, srcPositionY, srcWidth, srcHeight);

            if (this.hasToBlobSupport) {
                canvas.toBlob(function(blob) {
                    callback(blob, true);
                }, file.type);
            } else {
                let blob = this._toBlob(canvas, file.type);
                callback(blob, true);
            }

            return true;

        });


        this._loadImage(image, file);
        return true;
    }

    isSupported() {
        return this.hasBlobSupport && this.hasToBlobSupport && this.hasReaderSupport;
    }

    _loadImage(image, file, callback = null) {

        if (typeof URL === 'undefined') {
            let reader = new FileReader();

            reader.onload = (evt) => {

                image.src = evt.target;
                if (callback) {
                    callback();
                }
            };
            reader.readAsDataURL(file);
        } else {
            const objectUrl = URL.createObjectURL(file);
            image.src = objectUrl;
            setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
            }, 0);
            if (callback) {
                callback();
            }
        }
    }

    _toBlob(canvas, type) {
        let dataURI = canvas.toDataURL(type);
        let dataURIParts = dataURI.split(',');
        let byteString = null;
        if (dataURIParts[0].indexOf('base64') >= 0) {
            // Convert base64 to raw binary data held in a string:
            byteString = atob(dataURIParts[1]);
        } else {
            // Convert base64/URLEncoded data component to raw binary data:
            byteString = decodeURIComponent(dataURIParts[1]);
        }
        let arrayBuffer = new ArrayBuffer(byteString.length);
        let intArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i += 1) {
            intArray[i] = byteString.charCodeAt(i);
        }

        let mimeString = dataURIParts[0].split(':')[1].split(';')[0];
        let blob = null;

        blob = new Blob([this.hasArrayBufferViewSupport ? intArray : arrayBuffer], {
            type: mimeString
        });
        /*if (this.hasBlobConstructor) {
            blob = new Blob([this.hasArrayBufferViewSupport ? intArray : arrayBuffer], { type: mimeString });
        } else {
            let bb = new (window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder)();
            bb.append(arrayBuffer);
            blob = bb.getBlob(mimeString);
        }*/

        return blob;
    }




}