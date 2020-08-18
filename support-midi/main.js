function createHeader(format_, resolution_ = 480, nTrack_ = 1) {
    const chunkType = "MThd"; // チャンクタイプ
    const dataLen = 6; // データ長
    const format = format_; // フォーマット
    const nTrack = (format === 0) ? 1 : nTrack; // トラック数
    const resolution = resolution_; // 分解能

    const buffer = new ArrayBuffer(14);
    const view = new DataView(buffer);

    for (let i = 0; i < chunkType.length; i++)
        view.setUint8(i, chunkType.charCodeAt(i));
    view.setUint32(4, dataLen);
    view.setUint16(8, format);
    view.setUint16(10, nTrack);
    view.setUint16(12, resolution);

    return buffer;
}

class Event {
    constructor() { }

    variableData(num) {
        let bitLen = 0;
        for (let i = num; i >= 1; i >>= 1) bitLen++;
        if (bitLen === 0) bitLen = 1;
        const data = new Array(Math.ceil(bitLen / 7));
        for (let i = 0; i < data.length; i++) {
            data[i] = (num >> (i * 7)) & 0x7F;
            if (i !== 0) data[i] |= 0x80;
        }
        return data.reverse();
    }
}

class sysExEvent extends Event {
    constructor(deltaTime, dataAry) {
        super();
        // デルタタイムの可変長データ作成
        const deltaTimeAry = super.variableData(deltaTime);
        // データ長の可変長データ作成
        const dataSizeAry = super.variableData(dataAry.slice(1).length);

        this.buffer = new ArrayBuffer(deltaTimeAry.length + dataAry.length + dataSizeAry.length);
        this.view = new Uint8Array(this.buffer);
        let offset = 0;

        this.view.set(deltaTimeAry);
        offset += deltaTimeAry.length;
        this.view[offset++] = dataAry[0];
        this.view.set(dataSizeAry, offset);
        offset += dataSizeAry.length;
        this.view.set(dataAry.slice(1), offset);

        //console.log(this.view);
    }
}


function createTrack(data) {
    const chunkType = "MTrk"; // チャンクタイプ
    const dataLen = data.reduce((sum, currentValue) => sum + currentValue.buffer.byteLength, 0); // データ長

    const buffer = new ArrayBuffer(dataLen + 8);
    const view = new DataView(buffer);

    for (let i = 0; i < chunkType.length; i++)
        view.setUint8(i, chunkType.charCodeAt(i));
    view.setUint32(4, dataLen);
    let offset = 8;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].view.byteLength; j++) {
            view.setUint8(offset++, data[i].view[j]);
        }
    }

    return buffer;
}

function createMidiFile(data) {
    const headerBuf = new Uint8Array(createHeader(0));
    const trackBuf = new Uint8Array(createTrack(data));

    const buffer = new ArrayBuffer(headerBuf.byteLength + trackBuf.byteLength);
    const view = new Uint8Array(buffer);
    view.set(headerBuf);
    view.set(trackBuf, headerBuf.byteLength);

    console.log("create");
    console.log(view);

    //適当な見えないエレメントを作成                                                                                                                                       
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    console.log(a);

    //ArrayBufferをBlobに変換                                                                                                                                                
    var blob = new Blob([buffer], { type: "octet/stream" }),
        url = window.URL.createObjectURL(blob);
    console.log(url);

    //データを保存する                                                                                                                                                     
    a.href = url;
    a.download = "support.mid";
    a.click();
    window.URL.revokeObjectURL(url);
}

function createBaseMidi() {
    const data = [];
    data.push(new sysExEvent(0, [0xF0, 0x43, 0x70, 0x70, 0x73, 0xF7])); // EL ON
    data.push(new sysExEvent(0, [0xF0, 0x43, 0x70, 0x78, 0x44, 0x7E, 0x00, 0x00, 0x00, 0xF7])); // バンクAに設定
    data.push(new sysExEvent(0, [0xF0, 0x43, 0x70, 0x78, 0x41, 0x61, 0x01, 0xF7])); // SEQ.1 ON
    data.push(new sysExEvent(0, [0xF0, 0x43, 0x70, 0x78, 0x41, 0x62, 0x01, 0xF7])); // SEQ.2 ON
    data.push(new sysExEvent(0, [0xF0, 0x43, 0x70, 0x78, 0x41, 0x63, 0x01, 0xF7])); // SEQ.3 ON
    data.push(new sysExEvent(0, [0xF0, 0x43, 0x70, 0x78, 0x41, 0x64, 0x01, 0xF7])); // SEQ.4 ON
    data.push(new sysExEvent(480 * 4, [0xF0, 0x43, 0x60, 0x7A, 0xF7])); // RHYTHM START

    createMidiFile(data);
}

function main() {
    const baseMidiDlBtn = document.getElementById("base-midi-dl");
    baseMidiDlBtn.onclick = createBaseMidi;
}

main();