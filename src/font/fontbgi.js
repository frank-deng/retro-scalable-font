export class FontBGI{
    __cache={};
    constructor(fontData){
        this.__arrayBuffer=fontData;
        this.__dataView=new DataView(this.__arrayBuffer);

        //Get prefix text and font header offset
        let prefix=new Uint8Array(this.__arrayBuffer,0,0x80);
        let prefixText='', fontHeaderOffset=0;
        for(let v of prefix){
            fontHeaderOffset++;
            if(0x1a==v){
                break;
            }
            prefixText+=String.fromCharCode(v);
        }
        console.info(prefixText);

        let fontHeader=new DataView(this.__arrayBuffer.slice(fontHeaderOffset,fontHeaderOffset+12));
        let headerSize=fontHeader.getUint16(0,true);
        if(0x80!=headerSize){
            console.warn(`Incorrect header size: expected 0x80, got 0x${headerSize.toString(16)}`);
        }

        this.__fontName=new TextDecoder().decode(new Uint8Array(fontHeader.buffer.slice(2,6)));

        let fontSize=fontHeader.getUint16(6,true);
        if(fontSize!=this.__arrayBuffer.byteLength-0x80){
            console.warn(`Font size check failed: expected ${fontSize}, got ${this.__arrayBuffer.byteLength-0x80}`);
        }

        //Display version info
        console.info('Driver Version', fontHeader.getUint8(8), fontHeader.getUint8(9));
        console.info('BGI Revision', fontHeader.getUint8(10), fontHeader.getUint8(11));

        //Get header info
        let header=new DataView(this.__arrayBuffer.slice(headerSize,headerSize+16));
        let signature=header.getUint8(0);
        if(0x2b!=signature){
            throw new ReferenceError(`Error reading font file: expected 0x2b, got 0x${signature.toString(16)}`);
        }
        let charCount=this.__charCount=header.getUint16(1,true);
        console.log('charCount',charCount);
        this.__firstChar=header.getUint8(4);
        console.log('firstChar',this.__firstChar);
        let definitionOffset=header.getUint16(5,true);
        console.log('definitionOffset',definitionOffset);
        let scanable=header.getUint8(7);
        console.log('scanable',scanable);

        let top=header.getUint8(8), baseLine=header.getUint8(9), bottom=header.getUint8(10);
        console.log('top,baseline,bottom',top,baseLine,bottom);

        let offsetTableOffet=headerSize+16,
            widthTableOffset=offsetTableOffet+charCount*2;
        this.__baseOffset=widthTableOffset+charCount;
        this.__offset=new Uint16Array(this.__arrayBuffer.slice(offsetTableOffet,widthTableOffset));
        this.__width=new Uint8Array(this.__arrayBuffer.slice(widthTableOffset,this.__baseOffset));
    }
    getFontName(){
        return this.__fontName;
    }
    getGlyph(idx){
        if(idx<this.__firstChar || idx>(this.__firstChar+this.__charCount)){
            return null;
        }
        idx-=this.__firstChar;
        let offset=this.__baseOffset+this.__offset[idx], counter=100000, result=[];
        while(counter--){
            let value=this.__dataView.getUint8(offset);offset++;
            if(!value){
                break;
            }
            result.push(value);
        }
        if(counter<=0){
            console.error('死循环');
        }
        console.log('字符数据',result);
    }
}
