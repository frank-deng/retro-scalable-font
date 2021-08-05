import { FontManager } from ".";

export class MoveTo{
    constructor(x,y){
        Object.assign(this,{
            x,y
        });
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
export class Rect{
    constructor(x0,y0,x1,y1){
        Object.assign(this,{
            x0,y0,x1,y1
        });
    }
    rect(){
        return{
            x0:this.x0,
            y0:this.y0,
            x1:this.x1,
            y1:this.y1
        }
    }
    toSVG(){
        let {x0,y0,x1,y1}=this;
        return `M${x0} ${y0} H${x1} V${y1} H${x0} V${y0} Z`
    }
}
export class HorLineTo{
    constructor(x){
        Object.assign(this,{
            x
        });
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
export class VerLineTo{
    constructor(y){
        Object.assign(this,{
            y
        });
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
export class LineTo{
    constructor(x,y,rx=false,ry=false){
        Object.assign(this,{
            x,y,rx,ry
        });
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
export class QuadCurveTo{
    constructor(x0,y0,x1,y1,relative=false){
        Object.assign(this,{
            x0,y0,x1,y1,relative
        });
    }
    next(x,y){
        return {
            x:this.relative ? x+this.x1 : this.x1,
            y:this.relative ? y+this.y1 : this.y1
        };
    }
    toSVG(x,y){
        return `${this.relative ? 'q' : 'Q'}${this.x0} ${this.y0}, ${this.x1} ${this.y1}`;
    }
}
export class CurveTo{
    constructor(x0,y0,x1,y1,x2,y2,relative=false){
        Object.assign(this,{
            x0,y0,x1,y1,x2,y2,relative
        });
    }
    next(x,y){
        return {
            x:this.relative ? x+this.x2 : this.x2,
            y:this.relative ? y+this.y2 : this.y2
        };
    }
    toSVG(x,y){
        return `${this.relative ? 'c' : 'C'}${this.x0} ${this.y0}, ${this.x1} ${this.y1}, ${this.x2} ${this.y2}`;
    }
}
export class Path{
    constructor(strokeList=[]){
        this.__strokeList=strokeList;
    }
    add(item){
        this.__strokeList.push(item);
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
export function pathToSVG(path){
    let x=0, y=0, result=[];
    for(let item of path){
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
