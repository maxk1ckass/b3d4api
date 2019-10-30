/*************************************
*
*   gltf frame parser and other binary utils
*
*************************************/
// in browser, es6 module doesn't support local js files, (CORS)
// fall back to the old way, i.e. export to window object
(function () {
    const hexToBlob = (hexString, type = "image/jpeg") => {
        let byteArray = new Uint8Array(hexString.length / 2);
        for (let x = 0; x < byteArray.length; x++) {
            byteArray[x] = parseInt(hexString.substr(x * 2, 2), 16);
        }
        return new Blob([byteArray], { type });
    };

    const uint8ToBlog = (uint8, type = "image/jpeg") => {
        return new Blob([uint8], { type });
    };

    const blobToBuffer = (blob) => {
        // chrome version >= 76 has built-in arrayBuffer() function
        if (blob.arrayBuffer) {
            return blob.arrayBuffer();
        } else {
            return new Promise((resolve, reject) => {
                let fileReader = new FileReader();
                fileReader.onload = function () {
                    byteArray = this.result;
                    resolve(byteArray);
                };
                fileReader.readAsArrayBuffer(blob);
            });
        }
    };

    const bufferToInt32 = (buf) => {
        try {
            //return buf.readUIntLE(0, 4);
            const dataview = new DataView(buf.buffer);
            const int32le = dataview.getInt32(0, true);
            return int32le;
        } catch (e) {
            console.log(e);
            return 0;
        }
    }

    const parseFrame = (frame) => {
        const glTF = {};
        //glTF.tag = frame.slice(0,4).toString('utf8');
        glTF.tag = String.fromCharCode.apply(null, frame.slice(0, 4));
        glTF.version = bufferToInt32(frame.slice(4, 8));
        glTF.frameLength = bufferToInt32(frame.slice(8, 12));

        glTF.msgLength = bufferToInt32(frame.slice(12, 16));
        //glTF.msgType = frame.slice(16,20).toString('utf8');
        glTF.msgType = String.fromCharCode.apply(null, frame.slice(16, 20));
        //console.log('glTF:', glTF);
        let pos = 20 + glTF.msgLength;
        //const msg = frame.slice(20,pos).toString('utf8').trim();
        const msg = String.fromCharCode.apply(null, frame.slice(20, pos)).trim();

        try {
            glTF.event = JSON.parse(msg);
            glTF.state = 'OK';
        } catch (err) {
            console.log('gltf error:', err, msg);
            //glTF.state = {status:'ERROR_FILE_BAD_JSON', error:err, response_to:request, request_id:requestID};
            glTF.state = { status: 'ERROR_FILE_BAD_JSON', error: err };
            return glTF;
        }

        // Parse glTF binary data
        glTF.dataLength = bufferToInt32(frame.slice(pos, pos + 4));
        //b3dLib.log(glTF.dataLength, glTF.event);
        glTF.dataType = frame.slice(pos + 4, pos + 8).toString('utf8').replace(/\0/g, '');
        pos += 8;

        const bytes = glTF.event.filesize;
        glTF.data = frame.slice(pos, pos + bytes);
        return glTF;
    }

    const parseGltfBlob = async (gltfBlob) => {
        let buffer = await blobToBuffer(gltfBlob);
        const byteArray = new Uint8Array(buffer);
        const gltf = parseFrame(byteArray);
        return gltf;
    }

    const exports = {
        hexToBlob,
        uint8ToBlog,
        blobToBuffer,
        bufferToInt32,
        parseFrame,
        parseGltfBlob,
    };

    window.gltfutils = exports;
})();
