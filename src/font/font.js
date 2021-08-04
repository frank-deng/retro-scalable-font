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
        let array=new Uint8Array(this.__arrayBuffer,dataOffset,dataLen);
        let result=[];
        for(let value of array){
            result.push(value&0xf);
            result.push((value>>4)&0xf);
        }
        return result;
    }
    __processGlyphData(data){
        let idx=0;counter=10000;
        let ctrlTable={
            0:{
                step:4,
                processor(data,offset){
                    return new MoveTo(
                        (data[offset]<<4)|data[offset+1],
                        (data[offset+2]<<4)|data[offset+3]
                    );
                }
            },
            1:{
                step:2,
                processor(data,offset){
                    return new HorLineTo((data[offset]<<4)|data[offset+1]);
                }
            },
            2:{
                step:2,
                processor(data,offset){
                    return new VerLineTo((data[offset]<<4)|data[offset+1]);
                }
            },
            3:{
                step:4,
                processor(data,offset){
                    return new LineTo(
                        (data[offset]<<4)|data[offset+1],
                        (data[offset+2]<<4)|data[offset+3]
                    );
                }
            },
            4:{
                step:8,
                processor(data,offset){
                    return new CurveTo(
                        (data[offset]<<4)|data[offset+1],
                        (data[offset+2]<<4)|data[offset+3],
                        (data[offset+4]<<4)|data[offset+5],
                        (data[offset+6]<<4)|data[offset+7]
                    );
                }
            },
            5:{
                step:12,
                processor(data,offset){
                    return new QuadCurveTo(
                        (data[offset]<<4)|data[offset+1],
                        (data[offset+2]<<4)|data[offset+3],
                        (data[offset+4]<<4)|data[offset+5],
                        (data[offset+6]<<4)|data[offset+7],
                        (data[offset+8]<<4)|data[offset+9],
                        (data[offset+10]<<4)|data[offset+11]
                    );
                }
            },
            6:{
                step:8,
                processor(data,offset){
                    let x0=(data[offset]<<4)|data[offset+1],
                        y0=(data[offset+2]<<4)|data[offset+3],
                        x1=(data[offset+4]<<4)|data[offset+5],
                        y1=(data[offset+6]<<4)|data[offset+7]
                    return new CurveTo(x0,y0,x1,y1);
                }
            }
        };
        let result=[];
        while(idx<=data.length && counter--){
            ctrl=ctrlTable[data[idx]];
            idx++;
            if(idx+ctrl.step>=data.length){
                break;
            }
            let obj=ctrl.processor(data,idx);
            idx+=ctrl.step;
            result.push(obj);
        }
        if(!counter){
            throw new Error('Dead loop detected');
        }
        return result;
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
