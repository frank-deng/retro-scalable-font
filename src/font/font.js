import {
    Rect,
    HorLineTo,
    VerLineTo,
    MoveTo,
    LineTo,
    CurveTo,
    QuadCurveTo,
    Path,
    Glyph
} from './path';
function getNum8(data,offset){
    return (data[offset]<<4)|data[offset+1];
}
function getNum4(data,offset){
    let value=data[offset], num=value&7;
    return value&8 ? -num : num;
}
function getNum6Pair(data,offset){
    let n0=(data[offset]<<2)|(data[offset+1]>>2),
        n1=((data[offset+1]&3)<<4)|data[offset+2];
    let s0=n0&32, s1=n1&32;
    n0&=31; n1&=31;
    return [s0 ? -n0 : n0, s1 ? -n1 : n1];
}
class Font{
    constructor(fontData,fontName=null){
        //这是个抽象类，不能实例化
        if (Font==this.constructor) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.__arrayBuffer=fontData;
        this.__dataView=new DataView(this.__arrayBuffer);
        this.__fontName=fontName;
    }
    getFontName(){
        return this.__fontName;
    }
    __getGlyphData(idx){
        let dataView=this.__dataView, offset=idx*6;
        let dataOffset=dataView.getUint32(offset,true)&0xfffffff;
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
        let ctrlTable={
            0:{
                step:4,
                processor(data,offset){
                    return new MoveTo(getNum8(data,offset), getNum8(data,offset+2));
                }
            },
            1:{
                step:2,
                processor(data,offset){
                    return new HorLineTo(getNum8(data,offset));
                }
            },
            2:{
                step:2,
                processor(data,offset){
                    return new VerLineTo(getNum8(data,offset));
                }
            },
            3:{
                step:4,
                processor(data,offset){
                    return new LineTo(getNum8(data,offset), getNum8(data,offset+2));
                }
            },
            4:{
                step:8,
                processor(data,offset){
                    return new QuadCurveTo(
                        getNum8(data,offset),
                        getNum8(data,offset+2),
                        getNum8(data,offset+4),
                        getNum8(data,offset+6)
                    );
                }
            },
            5:{
                step:12,
                processor(data,offset){
                    return new CurveTo(
                        getNum8(data,offset),
                        getNum8(data,offset+2),
                        getNum8(data,offset+4),
                        getNum8(data,offset+6),
                        getNum8(data,offset+8),
                        getNum8(data,offset+10)
                    );
                }
            },
            6:{
                step:8,
                processor(data,offset){
                    return new Rect(
                        getNum8(data,offset),
                        getNum8(data,offset+2),
                        getNum8(data,offset+4),
                        getNum8(data,offset+6)
                    );
                }
            },
            7:{
                step:3,
                processor(data,offset){
                    return new LineTo(getNum4(data,offset),getNum8(data,offset+1),true,false);
                }
            },
            8:{
                step:3,
                processor(data,offset){
                    return new LineTo(getNum8(data,offset),getNum4(data,offset+2),false,true);
                }
            },
            9:{
                step:2,
                processor(data,offset){
                    return new LineTo(getNum4(data,offset),getNum4(data,offset+1),true,true);
                }
            },
            10:{
                step:3,
                processor(data,offset){
                    let [dx,dy]=getNum6Pair(data,offset);
                    return new LineTo(dx,dy,true,true);
                }
            },
            11:{
                step:4,
                processor(data,offset){
                    let dx0=getNum4(data,offset),
                        dy0=getNum4(data,offset+1),
                        dx1=getNum4(data,offset+2),
                        dy1=getNum4(data,offset+3);
                    return new QuadCurveTo(dx0,dy0,dx0+dx1,dy0+dy1,true);
                }
            },
            12:{
                step:6,
                processor(data,offset){
                    let [dx0,dy0]=getNum6Pair(data,offset);
                    let [dx1,dy1]=getNum6Pair(data,offset+3);
                    return new QuadCurveTo(dx0,dy0,dx0+dx1,dy0+dy1,true);
                }
            },
            13:{
                step:6,
                processor(data,offset){
                    let dx0=getNum4(data,offset),
                        dy0=getNum4(data,offset+1),
                        dx1=getNum4(data,offset+2),
                        dy1=getNum4(data,offset+3),
                        dx2=getNum4(data,offset+4),
                        dy2=getNum4(data,offset+5);
                    return new CurveTo(
                        dx0,
                        dy0,
                        dx0+dx1,
                        dy0+dy1,
                        dx0+dx1+dx2,
                        dy0+dy1+dy2,
                        true);
                }
            },
            14:{
                step:9,
                processor(data,offset){
                    let [dx0,dy0]=getNum6Pair(data,offset);
                    let [dx1,dy1]=getNum6Pair(data,offset+3);
                    let [dx2,dy2]=getNum6Pair(data,offset+6);
                    return new CurveTo(
                        dx0,
                        dy0,
                        dx0+dx1,
                        dy0+dy1,
                        dx0+dx1+dx2,
                        dy0+dy1+dy2,
                        true);
                }
            },
            15:{
                step:4,
                processor(data,offset){}
            }
        };
        let idx=0,path=new Path(),counter=10000;
        while(idx<=data.length && counter--){
            let ctrl=ctrlTable[data[idx]];
            idx++;
            if(idx>=data.length){
                break;
            }
            let pathElement=ctrl.processor(data,idx);
            idx+=ctrl.step;
            if(pathElement){
                path.add(pathElement);
            }
        }
        if(!counter){
            throw new Error('Dead loop detected');
        }
        return path;
    }
    getGlyph(idx){
        return this.__processGlyphData(this.__getGlyphData(idx));
    }
}
export class FontASC extends Font{
    BASE_HEIGHT=128;
    constructor(fontData,fontNames){
        super(fontData);
        this.__fontNames=fontNames;
    }
    getFontNames(){
        return this.__fontNames;
    }
    getGlyph(charIdx,fontIdx=0){
        //处理英文空格
        if(0==charIdx){
            return {
                width:50
            };
        }
        return new Glyph(super.getGlyph((charIdx-1)+fontIdx*94));
    }
}
export class FontHZK extends Font{
    BASE_HEIGHT=170;
    BASE_WIDTH=170;
    constructor(fontData,fontName){
        super(fontData,fontName);
    }
    getGlyph(qu,wei,isSymbol=false){
        return new Glyph(super.getGlyph((isSymbol ? qu-0xa1 : qu-0xb0)*94+(wei-0xa1)));
    }
}
