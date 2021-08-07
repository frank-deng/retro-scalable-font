import fontInfo from './fontInfo.json';
import iconv from 'iconv-lite';
import { FontASC, FontHZK, FontGBK } from './font';

export class FontManager{
    __hzkFont={};
    __ascFontList=[];
    __hzkFontList=[];
    constructor(fontData){
        this.__hzkFont={};
        for(let font of fontData){
            if('ASCPS'==font.file){
                this.__ascFont=new FontASC(font.data);
                this.__ascFontList=font.fontNames.slice();
                continue;
            }else if('HZKPST'==font.file){
                this.__hzkSymbolFont=new FontHZK(font.data,true);
                continue;
            }else{
                this.__hzkFont[font.file]=/.GBK$/i.test(font.file) ? new FontGBK(font.data) : new FontHZK(font.data);
                this.__hzkFontList.push({
                    label:font.name,
                    value:font.file
                });
            }
        }
    }
    __checkFontParam(ascFont,hzkFont){
        if(isNaN(ascFont) || null===ascFont || ascFont<0 || ascFont>9){
            throw new ValueError('西文字体必须为0-9的数字');
        }
        if(!this.__hzkFont[hzkFont]){
            throw new ValueError('指定的中文字体不存在');
        }
    }
    getAscFontList(){
        return this.__ascFontList.map((label,value)=>({
            label,
            value
        }));
    }
    getHzkFontList(){
        return this.__hzkFontList.map(item=>({
            ...item
        }));
    }
    getGlyph(char,ascFont=0,hzkFont){
        //参数检测
        this.__checkFontParam(ascFont,hzkFont);

        let code=char.charCodeAt(0);
        //控制字符不支持
        if(code<0x20){
            return null;
        }
        //作为英文字符处理
        if(code<=0x7e){
            return this.__ascFont.getGlyph(code-0x20,ascFont);
        }
        //作为中文字符处理
        let iconvBuf=iconv.encode(char,'GBK');
        let hzkFontInstance=this.__hzkFont[hzkFont];

        //当前字符无法表示为GB2312或GBK
        if(2!=iconvBuf.length){
            return null;
        }
        
        //GBK字体使用
        if (hzkFontInstance instanceof FontGBK){
            return hzkFontInstance.getGlyph(iconvBuf[0],iconvBuf[1]);
        }

        //当前字符在GBK范围内但不在GB2312范围内
        let qu=iconvBuf[0], wei=iconvBuf[1];
        if(qu<0xa1 || (qu>0xa9 && qu<0xb0) || wei<0xa1 || wei>0xfe){
            return null;
        }
        //符号字库使用
        if(qu<0xb0){
            return this.__hzkSymbolFont.getGlyph(qu,wei);
        }
        //汉字字库使用
        return hzkFontInstance.getGlyph(qu,wei);
    }
}

import axios from 'axios';
export async function initFontManager(){
    let fontInfoNew=await Promise.all(fontInfo.map(async(font)=>{
        try{
            let resp=await axios.get(`./public/fonts/${font.file}`,{
                responseType: 'arraybuffer'
            });
            return{
                ...font,
                data:resp.data
            };
        }catch(e){
            if(font.required){
                throw new Error(`Failed to load required font ${font.name||font.file}`,e);
            }
            console.warn(`Failed to load font ${font.name||font.file}`,e);
        }
        return null;
    }));
    return new FontManager(fontInfoNew.filter(font=>font));
}
