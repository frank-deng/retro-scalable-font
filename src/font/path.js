function calculateBezierPoint(fraction,...args){
    let xCalc=[], yCalc=[], xTemp=[], yTemp=[], counter=1000;
    for(let i=0; i<args.length; i+=2){
        xCalc.push(args[i]);
        yCalc.push(args[i+1]);
    }
    while(xCalc.length>1 && --counter){
        let len=xCalc.length-1;
        for(let i=0; i<len; i++){
            xTemp.push(xCalc[i]+(xCalc[i+1]-xCalc[i])*fraction);
            yTemp.push(yCalc[i]+(yCalc[i+1]-yCalc[i])*fraction);
        }
        xCalc=xTemp;
        yCalc=yTemp;
        xTemp=[];
        yTemp=[];
    }
    if(counter<=0){
        throw new Error('Dead loop');
    }
    return {
        x:xCalc[0],
        y:yCalc[0]
    };
}
export class PathElement{
    constructor(){
        if (PathElement==this.constructor) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
    __init__(item){
        if(!(item instanceof this.constructor)){
            throw new TypeError('Source object must be instance of PathElement');
        }
        if(undefined!==this.xStart && undefined!==this.yStart){
            item.setPos(this.xStart,this.yStart);
        }
        return item;
    }
    clone(){
        throw new Error('clone() method not implemented');
    }
    setPos(xStart,yStart){
        Object.assign(this,{
            xStart,
            yStart
        });
        return this;
    }
    getPos(){
        if(undefined===this.xStart || undefined===this.yStart){
            throw new Error('Start position not specified');
        }
        return {
            x:this.xStart,
            y:this.yStart
        };
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
    next(){
        return {
            x:this.x,
            y:this.y
        };
    }
    getBoundingRect(){
        throw new Error(`Bounding rectangle calculation not available for MoveTo`);
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
    getBoundingRect(){
        return{
            x0:Math.min(this.x0,this.x1),
            y0:Math.min(this.y0,this.y1),
            x1:Math.max(this.x0,this.x1),
            y1:Math.max(this.y0,this.y1),
        }
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
        return super.__init__(new this.constructor(this.x));
    }
    next(){
        return {
            x:this.x,
            y:this.yStart
        };
    }
    getBoundingRect(){
        let {x,y}=this.getPos();
        return{
            x0:Math.min(x,this.x),
            y0:y,
            x1:Math.max(x,this.x),
            y1:y
        }
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
        return super.__init__(new this.constructor(this.y));
    }
    next(){
        return {
            x:this.xStart,
            y:this.y
        };
    }
    getBoundingRect(){
        let {x,y}=this.getPos();
        return{
            x0:x,
            y0:Math.min(y,this.y),
            x1:x,
            y1:Math.max(y,this.y)
        }
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
        return super.__init__(new this.constructor(this.x,this.y,this.rx,this.ry));
    }
    next(){
        return {
            x:this.rx ? this.xStart+this.x : this.x,
            y:this.ry ? this.yStart+this.y : this.y
        };
    }
    getBoundingRect(){
        let {x,y}=this.getPos();
        let pos=this.next();
        return{
            x0:Math.min(x,pos.x),
            y0:Math.min(y,pos.y),
            x1:Math.max(x,pos.x),
            y1:Math.max(y,pos.y)
        }
    }
    toSVG(){
        if(!this.rx && !this.ry){
            return `L${this.x} ${this.y}`;
        }else if(this.rx && this.ry){
            return `l${this.x} ${this.y}`;
        }
        let {x,y}=this.getPos();
        return `L${this.rx ? x+this.x : this.x} ${this.ry ? y+this.y : this.y}`;
    }
}
export class QuadCurveTo extends PathElement{
    __boundingRect=null;
    constructor(x0,y0,x1,y1,relative=false){
        super();
        Object.assign(this,{
            x0,y0,x1,y1,relative
        });
    }
    __calculateBoundingRect(){
        let x=this.xStart,
            y=this.yStart,
            x0=this.relative ? x+this.x0 : this.x0,
            y0=this.relative ? y+this.y0 : this.y0,
            x1=this.relative ? x+this.x1 : this.x1,
            y1=this.relative ? y+this.y1 : this.y1,
            xMin=x, xMax=x, yMin=y, yMax=y;
        const FRACTION=100;
        for(let i=0; i<FRACTION; i++){
            let p=calculateBezierPoint(i/FRACTION,x,y,x0,y0,x1,y1);
            xMin=Math.min(xMin,p.x);
            yMin=Math.min(yMin,p.y);
            xMax=Math.max(xMax,p.x);
            yMax=Math.max(yMax,p.y);
        }
        this.__boundingRect={
            x0:Math.floor(xMin),
            y0:Math.floor(yMin),
            x1:Math.ceil(xMax),
            y1:Math.ceil(yMax)
        };
    }
    setPos(x,y){
        super.setPos(x,y);
        this.__calculateBoundingRect();
        return this;
    }
    clone(){
        return (new this.constructor(this.x0,this.y0,this.x1,this.y1,this.relative)).setPos(this.xStart,this.yStart);
    }
    next(){
        return {
            x:this.relative ? this.xStart+this.x1 : this.x1,
            y:this.relative ? this.yStart+this.y1 : this.y1
        };
    }
    getBoundingRect(){
        if(!this.__boundingRect){
            throw new Error('Start position not set');
        }
        return {
            ...this.__boundingRect
        };
    }
    toSVG(){
        return `${this.relative ? 'q' : 'Q'}${this.x0} ${this.y0}, ${this.x1} ${this.y1}`;
    }
}
export class CurveTo extends PathElement{
    __boundingRect=null;
    constructor(x0,y0,x1,y1,x2,y2,relative=false){
        super();
        Object.assign(this,{
            x0,y0,x1,y1,x2,y2,relative
        });
    }
    clone(){
        return (new this.constructor(this.x0,this.y0,this.x1,this.y1,this.x2,this.y2,this.relative)).setPos(this.xStart,this.yStart);
    }
    __calculateBoundingRect(){
        let x=this.xStart,
            y=this.yStart,
            x0=this.relative ? x+this.x0 : this.x0,
            y0=this.relative ? y+this.y0 : this.y0,
            x1=this.relative ? x+this.x1 : this.x1,
            y1=this.relative ? y+this.y1 : this.y1,
            x2=this.relative ? x+this.x2 : this.x2,
            y2=this.relative ? y+this.y2 : this.y2,
            xMin=x, xMax=x, yMin=y, yMax=y;
        const FRACTION=100;
        for(let i=0; i<FRACTION; i++){
            let p=calculateBezierPoint(i/FRACTION,x,y,x0,y0,x1,y1,x2,y2);
            xMin=Math.min(xMin,p.x);
            yMin=Math.min(yMin,p.y);
            xMax=Math.max(xMax,p.x);
            yMax=Math.max(yMax,p.y);
        }
        this.__boundingRect={
            x0:Math.floor(xMin),
            y0:Math.floor(yMin),
            x1:Math.ceil(xMax),
            y1:Math.ceil(yMax)
        };
    }
    setPos(x,y){
        super.setPos(x,y);
        this.__calculateBoundingRect();
        return this;
    }
    next(){
        return {
            x:this.relative ? this.xStart+this.x2 : this.x2,
            y:this.relative ? this.yStart+this.y2 : this.y2
        };
    }
    getBoundingRect(){
        if(!this.__boundingRect){
            throw new Error('Start position not set');
        }
        return {
            ...this.__boundingRect
        };
    }
    toSVG(){
        return `${this.relative ? 'c' : 'C'}${this.x0} ${this.y0}, ${this.x1} ${this.y1}, ${this.x2} ${this.y2}`;
    }
}

export class Path{
    __strokeList=[];
    __closedPath=true;
    __x=0;
    __y=0;
    __bbox={
        x0:null,
        y0:null,
        x1:null,
        y1:null
    }
    constructor(src=[]){
        let strokeList=src;
        if(src instanceof Path){
            strokeList=src.__strokeList;
        }else if(!Array.isArray(src)){
            throw new TypeError('Initialization parameter must be either an array or an instance of Path class');
        }
        for(let item of strokeList){
            this.add(item);
        }
    }
    reset(){
        Object.assign(this,{
            __strokeList:[],
            __bbox:{
                x0:null,
                y0:null,
                x1:null,
                y1:null
            },
            __x:0,
            __y:0
        })
    }
    __calculateBoundingRect(item){
        try{
            let bbox=item.getBoundingRect();
            let {x0,y0,x1,y1}=this.__bbox;
            let xMin=Math.floor(Math.min(bbox.x0,bbox.x1)),
                xMax=Math.ceil(Math.max(bbox.x0,bbox.x1)),
                yMin=Math.floor(Math.min(bbox.y0,bbox.y1)),
                yMax=Math.ceil(Math.max(bbox.y0,bbox.y1));
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
            Object.assign(this.__bbox,{
                x0,y0,x1,y1
            })
        }catch(e){
            console.error('Failed to update bounding box',e);
        }
    }
    add(itemOrig){
        if(!(itemOrig instanceof PathElement)){
            throw new TypeError('Item must inherit class PathElement');
        }
        let item=itemOrig.clone();

        //?????????????????????????????????
        if(item instanceof Rect){
            this.__strokeList.unshift(item);
            this.__calculateBoundingRect(item);
            return;
        }
        
        this.__strokeList.push(item);
        if(!(item instanceof MoveTo)){
            item.setPos(this.__x,this.__y);
            this.__calculateBoundingRect(item);
        }
        let nextPos=item.next();
        Object.assign(this,{
            __x:nextPos.x,
            __y:nextPos.y
        });
    }
    getBoundingRect(){
        if(this.isEmpty()){
            return null;
        }
        return {
            ...this.__bbox
        };
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
    setClosedPath(val=true){
        this.__closedPath=!!val;
    }
    toSVG(){
        if(this.isEmpty()){
            return null;
        }
        return this.__strokeList.map(item=>item.toSVG()).join(' ')+(this.__closedPath ? ' Z' : '');
    }
}
