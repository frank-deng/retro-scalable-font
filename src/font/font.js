import {
    Rect,
    HorLineTo,
    VerLineTo,
    MoveTo,
    LineTo,
    CurveTo,
    QuadCurveTo
} from './pathElements';
class Font{
    constructor(fontData){
        //这是个抽象类，不能实例化
        if (Font==this.constructor) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.__arrayBuffer=fontData;
        this.__dataView=new DataView(this.__arrayBuffer);
    }
    __getGlyphData(idx){
        let dataView=this.__dataView, offset=idx*6;
        let dataOffset=dataView.getInt32(offset,true)&0xfffffff;
        let dataLen=dataView.getUint16(offset+4,true);
        if(!dataLen){
            return null;
        }
        return new Uint8Array(this.__arrayBuffer,dataOffset,dataLen);
    }
    getGlyph(idx){
        return this.__getGlyphData(idx);
    }
}
export class FontASC extends Font{
    BASE_HEIGHT=255;
    constructor(fontData){
        super(fontData);
    }
    getGlyph(charIdx,fontIdx=0){
        //处理英文空格
        if(0==charIdx){
            return {
                width:100
            };
        }
        return super.getGlyph((charIdx-1)+fontIdx*94);
    }
}
export class FontHZK extends Font{
    BASE_HEIGHT=255;
    BASE_WIDTH=255;
    constructor(fontData){
        super(fontData);
    }
    getGlyph(qu,wei,isSymbol=false){
        //处理英文空格
        qu=isSymbol ? qu-0xa1 : qu-0xb0;
        wei=wei-0xa1;
        offset=qu*94+wei;
        return super.getGlyph(offset);
    }
}
