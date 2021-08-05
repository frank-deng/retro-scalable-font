import axios from 'axios';
import {Font} from './font';
class TestFont extends Font{
    constructor(fontData){
        super(fontData);
    }
}
async function loadFont(fileName){
    let resp=await axios.get(`./public/fonts/${fileName}`,{
        responseType: 'arraybuffer'
    });
    if(200!=resp.status){
        throw resp;
    }
    return resp.data;
}
export default async function(){
    let charCount=93*10;
    let fontASC=new TestFont(await loadFont('ASCPS'));
    let x0=null, y0=null, x1=null, y1=null;
    for(let i=0; i<charCount; i++){
        try{
            let path=fontASC.getGlyph(i);
            let rect=path.getBoundingRect();
            let xMin=rect.x0, xMax=rect.x1, yMin=rect.y0, yMax=rect.y1;
            if(null===x0 || xMin<x0){
                x0=xMin;
            }
            if(null===x1 || xMax>x1){
                x1=xMax;
            }
            if(null===y0 || yMin<y0){
                y0=yMin;
            }
            if(null===y1 || yMax>y1){
                y1=yMax;
            }
        }catch(e){
            console.error(e);
        }
    }
    console.log(x0,y0,x1,y1);
}