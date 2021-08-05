import { FontManager } from ".";

export class PathElement{
    constructor(){
        //这是个抽象类，不能实例化
        if (PathElement==this.constructor) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
    clone(){
        throw new Error('clone() method not implemented');
    }
    setStartPos(xStart,yStart){
        Object.assign(this,{
            xStart,
            yStart
        });
    }
}
export class MoveTo extends PathElement{
    constructor(x,y){
        super();
        Object.assign(this,{
            x,y
        });
    }
    clone(){
        return new this.constructor(this.x,this.y);
    }
    next(x,y){
        return {
            x:this.x,
            y:this.y
        };
    }
    toSVG(){
        return `M${this.x} ${this.y}`;
    }
}
export class Rect extends PathElement{
    constructor(x0,y0,x1,y1){
        super();
        Object.assign(this,{
            x0,y0,x1,y1
        });
    }
    clone(){
        return new this.constructor(this.x0,this.y0,this.x1,this.y1);
    }
    toSVG(){
        let {x0,y0,x1,y1}=this;
        return `M${x0} ${y0} H${x1} V${y1} H${x0} V${y0} Z`
    }
}
export class HorLineTo extends PathElement{
    constructor(x){
        super();
        Object.assign(this,{
            x
        });
    }
    clone(){
        return new this.constructor(this.x);
    }
    next(x,y){
        return {
            x:this.x,
            y
        };
    }
    toSVG(){
        return `H${this.x}`;
    }
}
export class VerLineTo extends PathElement{
    constructor(y){
        super();
        Object.assign(this,{
            y
        });
    }
    clone(){
        return new this.constructor(this.y);
    }
    next(x,y){
        return {
            x,
            y:this.y
        };
    }
    toSVG(){
        return `V${this.y}`;
    }
}
export class LineTo extends PathElement{
    constructor(x,y,rx=false,ry=false){
        super();
        Object.assign(this,{
            x,y,rx,ry
        });
    }
    clone(){
        return new this.constructor(this.x,this.y,this.rx,this.ry);
    }
    next(x,y){
        return {
            x:this.rx ? x+this.x : this.x,
            y:this.ry ? y+this.y : this.y
        };
    }
    toSVG(x=null,y=null){
        if(!this.rx && !this.ry){
            return `L${this.x} ${this.y}`;
        }else if(this.rx && this.ry){
            return `l${this.x} ${this.y}`;
        }
        return `L${this.rx ? x+this.x : this.x} ${this.ry ? y+this.y : this.y}`;
    }
}
export class QuadCurveTo extends PathElement{
    constructor(x0,y0,x1,y1,relative=false){
        super();
        Object.assign(this,{
            x0,y0,x1,y1,relative
        });
    }
    clone(){
        return new this.constructor(this.x0,this.y0,this.x1,this.y1,this.relative);
    }
    next(x,y){
        return {
            x:this.relative ? x+this.x1 : this.x1,
            y:this.relative ? y+this.y1 : this.y1
        };
    }
    toSVG(){
        return `${this.relative ? 'q' : 'Q'}${this.x0} ${this.y0}, ${this.x1} ${this.y1}`;
    }
}
export class CurveTo extends PathElement{
    constructor(x0,y0,x1,y1,x2,y2,relative=false){
        super();
        Object.assign(this,{
            x0,y0,x1,y1,x2,y2,relative
        });
    }
    clone(){
        return new this.constructor(this.x0,this.y0,this.x1,this.y1,this.x2,this.y2,this.relative);
    }
    next(x,y){
        return {
            x:this.relative ? x+this.x2 : this.x2,
            y:this.relative ? y+this.y2 : this.y2
        };
    }
    toSVG(){
        return `${this.relative ? 'c' : 'C'}${this.x0} ${this.y0}, ${this.x1} ${this.y1}, ${this.x2} ${this.y2}`;
    }
}
export class Path{
    __strokeList=[];
    constructor(strokeList=[]){
        if(strokeList instanceof Path){
            return strokeList.clone();
        }
        for(let item of strokeList){
            this.add(item);
        }
    }
    clone(){
        let newPath=new Path();
        for(let item of this.__strokeList){
            newPath.add(item);
        }
        return newPath;
    }
    reset(){
        this.__strokeList=[];
    }
    add(itemOrig){
        if(!(itemOrig instanceof PathElement)){
            throw new TypeError('Item must inherit class PathElement');
        }
        this.__strokeList.push(itemOrig.clone());
    }
    merge(path){
        if(!(path instanceof Path)){
            throw new TypeError('Item must be instance of Path');
        }
        for(let item of path.__strokeList){
            this.add(item);
        }
    }
    isEmpty(){
        for(let item of this.__strokeList){
            if(item instanceof MoveTo){
                continue;
            }
            return false;
        }
        return true;
    }
    toSVG(){
        let x=0, y=0, result=[];
        for(let item of this.__strokeList){
            result.push(item.toSVG(x,y));
            if(!item.next){
                continue;
            }
            let pos=item.next(x,y);
            x=pos.x;
            y=pos.y;
        }
        return result.join(' ')+' Z';
    }
}
export class Glyph{
    __pathList=[];
    constructor(pathList=[]){
        if(pathList instanceof Glyph){
            return pathList.clone();
        }
        for(let item of pathList){
            this.addPath(item);
        }
    }
    clone(){
        return new Glyph(this.__pathList);
    }
    addPath(item){
        if(!(item instanceof Path)){
            throw new TypeError('Item must be instance of Path');
        }
        this.__pathList.push(item.clone());
    }
    toSVG(){
        return this.__pathList.map(item=>item.toSVG());
    }
}
