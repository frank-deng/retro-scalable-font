import iconv from 'iconv-lite';
import { FontASC, FontHZK, FontGBK, Glyph } from './font';
import { FontBGI } from './fontbgi';

export class FontManager{
    __bgiFont={};
    __ascFontList=[];
    __hzkFont={};
    __hzkFontList=[];
    constructor(fontData){
        this.__hzkFont={};
        for(let font of fontData){
            if(/.CHR$/i.test(font.id)){
                let bgiFont=new FontBGI(font.data);
                let fontName=bgiFont.getFontName();
                this.__bgiFont[fontName]=bgiFont;
                this.__ascFontList.push({
                    label:fontName+' (BGI)',
                    value:fontName
                });
            }else if('ASCPS'==font.id){
                this.__ascFont=new FontASC(font.data);
                this.__ascFontList=this.__ascFontList.concat(font.fontNames.map((label,value)=>({
                    label,
                    value
                })));
                continue;
            }else if('HZKPST'==font.id){
                this.__hzkSymbolFont=new FontHZK(font.data,true);
                continue;
            }else{
                this.__hzkFont[font.id]=/.GBK$/i.test(font.id) ? new FontGBK(font.data) : new FontHZK(font.data);
                this.__hzkFontList.push({
                    label:font.name,
                    value:font.id
                });
            }
        }
    }
    __checkFontParam(ascFont,hzkFont){
        if(!this.__bgiFont[ascFont] && (isNaN(ascFont) || null===ascFont || ascFont<0 || ascFont>9)){
            throw new ReferenceError('西文字体必须为0-9的数字，或指定的BGI字体名称');
        }
        if(!this.__hzkFont[hzkFont]){
            throw new ReferenceError('指定的中文字体不存在');
        }
    }
    getAscFontList(){
        return this.__ascFontList.map(item=>({
            ...item
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
            if(this.__bgiFont[ascFont]){
                return this.__bgiFont[ascFont].getGlyph(code,Glyph.BASE_HEIGHT-4);
            }
            return this.__ascFont ? this.__ascFont.getGlyph(code,ascFont) : null;
        }
        
        //找到当前中文字体
        let hzkFontInstance=this.__hzkFont[hzkFont];
        if(!hzkFontInstance){
            return null;
        }

        //当前字符无法表示为GB2312或GBK
        let iconvBuf=iconv.encode(char,'GBK');
        if(2!=iconvBuf.length){
            return null;
        }
        let qu=iconvBuf[0], wei=iconvBuf[1];
        
        //GBK字体使用
        if (hzkFontInstance instanceof FontGBK){
            return hzkFontInstance.getGlyph(qu,wei);
        }
        //符号字库使用
        if(qu<0xb0){
            return this.__hzkSymbolFont ? this.__hzkSymbolFont.getGlyph(qu,wei) : null;
        }
        //汉字字库使用
        return hzkFontInstance.getGlyph(qu,wei);
    }
}
