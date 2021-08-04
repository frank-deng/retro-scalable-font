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
}
export class VerLineTo{
    constructor(y){
        Object.assign(this,{
            y
        });
    }
}
export class MoveTo{
    constructor(x,y){
        Object.assign(this,{
            x,y
        });
    }
}
export class LineTo{
    constructor(x,y,rx=false,ry=false){
        Object.assign(this,{
            x,y,rx,ry
        });
    }
}
export class CurveTo{
    constructor(x0,y0,x1,y1,relative=false){
        Object.assign(this,{
            x0,y0,x1,y1,relative
        });
    }
}
export class QuadCurveTo{
    constructor(x0,y0,x1,y1,x2,y2,relative=false){
        Object.assign(this,{
            x0,y0,x1,y1,x2,y2,relative
        });
    }
}
