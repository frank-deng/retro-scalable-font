import fontInfo from './fontInfo.json';
import iconv from 'iconv-lite';
import { FontASC, FontHZK } from './font';

export class FontManager{
    __ascFontIdx=0;
    __hzkFontName='HZKPSSTJ';
    constructor(fontData){
        this.__hzkFont={};
        for(let fontName in fontData){
            let item=fontData[fontName];
            switch(item.type){
                case 'ascii':
                    this.__ascFont=new FontASC(item.data);
                break;
                case 'fuhao':
                    this.__hzkSymbolFont=new FontHZK(item.data);
                break;
                default:
                    this.__hzkFont[fontName]=new FontHZK(item.data);
                break;
            }
        }
        if(!this.__hzkFont[this.__hzkFontName]){
            this.__hzkFontName=Object.keys(this.__hzkFont)[0];
        }
    }
    setFont(ascFont,hzkFont){
        if(isNaN(ascFont) || null===ascFont || ascFont<0 || ascFont>9){
            throw new ValueError('西文字体必须为0-9的数字');
        }
        if(!this.__hzkFont[hzkFont]){
            throw new ValueError('指定的中文字体不存在');
        }
        Object.assign(this,{
            __ascFontIdx:ascFont,
            __hzkFontName:hzkFont
        });
    }
    getGlyph(char){
        let code=char.charCodeAt(0);
        //控制字符不支持
        if(code<0x20){
            return null;
        }
        //作为英文字符处理
        if(code<=0x7e){
            return this.__ascFont.getGlyph(code-0x20,this.__ascFontIdx);
        }
        //作为中文字符处理
        let iconvBuf=iconv(char,'GB2312');
        //当前字符无法表示为GB2312或GBK
        if(2!=iconvBuf.length){
            return null;
        }
        //当前字符在GBK范围内但不在GB2312范围内
        let qu=iconvBuf[0], wei=iconvBuf[1];
        if(qu<0xa1 || (qu>0xa9 && qu<0xb0) || wei<0xa1 || wei>0xfe){
            return null;
        }
        //符号字库使用
        if(qu<0xb0){
            return this.__hzkSymbolFont.getGlyph(qu,wei,true);
        }
        //汉字字库使用
        return this.__hzkFont[this.__hzkFontName].getGlyph(qu,wei);
    }
}

import axios from 'axios';
async function loadFont(fileName){
    let resp=await axios.get(`./public/fonts/${fileName}`,{
        responseType: 'arraybuffer'
    });
    if(200!=resp.status){
        throw resp;
    }
    let result={};
    result[fileName]=resp.data;
    return result;
}
export async function initFontManager(){
    let tasks=[], fontInfoNew={};
    for(let fontName in fontInfo){
        fontInfoNew[fontName]={
            ...fontInfo[fontName]
        }
        tasks.push(loadFont(fontName));
    }
    for(let fontDataLoaded of await Promise.all(tasks)){
        try{
            let fontName=Object.keys(fontDataLoaded)[0],
                fontData=fontDataLoaded[fontName];
            fontInfoNew[fontName].data=fontData;
        }catch(e){
            console.error(e);
        }
    }
    return new FontManager(fontInfoNew);
}