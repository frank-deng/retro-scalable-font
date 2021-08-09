function processNumber(num){
    if(num&0x40){
        num=~((~num)&0x3f);
    }else{
        num&=0x3f;
    }
    return num;
}

import { MoveTo,LineTo,Path } from "./path";
export class GlyphBGI extends Path{
    constructor(param){
        super(param);
    }
}
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

        this.__top=header.getInt8(8);
        this.__baseLine=header.getInt8(9);
        this.__bottom=header.getInt8(10);

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
        let offset=this.__baseOffset+this.__offset[idx-this.__firstChar], counter=100000, path=new Path();
        path.setClosedPath(false);
        let x=0, y=0;
        while(counter--){
            let dx=this.__dataView.getUint8(offset);offset++;
            let dy=this.__dataView.getUint8(offset);offset++;
            let oper=0;
            if(dx&0x80){
                oper|=2;
            }
            if(dy&0x80){
                oper|=1;
            }
            if(!oper){
                break;
            }
            x=processNumber(dx);
            y=processNumber(dy);
            if(this.__bottom<this.__top){
                y=-y;
            }
            y+=this.__top;
            switch(oper){
                case 1:
                    console.warn('Scan', x,y);
                break;
                case 2:
                    path.add(new MoveTo(x,y));
                break;
                case 3:
                    path.add(new LineTo(x,y));
                break;
            }
        }
        if(counter<=0){
            console.error('死循环');
        }
        console.log(path);
        return path;
    }
}
