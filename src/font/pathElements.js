export class Rect{
    constructor(x0,y0,x1,y1){
        Object.assign(this,{
            x0,y0,x1,y1
        });
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
            x:x+this.x,
            y
        };
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
}
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
}
export class CurveTo{
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
}
export class QuadCurveTo{
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
}
