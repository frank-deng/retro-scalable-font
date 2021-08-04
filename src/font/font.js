class Font{
    constructor(fontData){
        //这是个抽象类，不能实例化
        if (Font==this.constructor) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.__fontData=fontData;
        this.__dataView=new DataView(this.__fontData);
    }
    __getCharMeta(offset){
        let dataView=this.__dataView;
        return{
            offset:(dataView.getUInt32(offset,true)&0xfffffff),
            length:dataView.getUint16(offset+4,true)
        };
    }
    getGlyph(idx){
        let {offset,dataLen}=this.__getCharMeta(idx*6);
        if(!dataLen){
            return null;
        }
        return new Uint8Array(arrayBuffer,offset,dataLen);
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
}
