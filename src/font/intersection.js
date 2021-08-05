import {
    checkIntersection,
    colinearPointWithinSegment
  } from 'line-intersect';
import {
    Rect,HorLineTo,VerLineTo,LineTo,CurveTo,QuadCurveTo
} from './path';
export default class Intersection{
    static __checkType(src){
        let result=null;
        if(!result){
            for(let type of [Rect,HorLineTo,VerLineTo,LineTo]){
                if(src instanceof type){
                    return 'line';
                }
            }
            for(let type of [CurveTo,QuadCurveTo]){
                if(src instanceof type){
                    return 'curve';
                }
            }
        }
        if(!result){
            throw new TypeError('Source type is not supported for intersection detection.');
        }
        return result;
    }
    static __getLines(src){
        if(src instanceof Rect){
            let {x0,y0,x1,y1}=src;
            return [
                [x0,y0,x1,y0],
                [x1,y0,x1,y1],
                [x1,y1,x0,y1],
                [x0,y1,x0,y0]
            ];
        }
        let pos0=src.getPos(), pos1=src.next();
        return [
            [pos0.x,pos0.y,pos1.x,pos1.y]
        ];
    }
    static __lineIntersect(a,b){
        let intersection=checkIntersection(a[0],a[1],a[2],a[3],b[0],b[1],b[2],b[3]);
        switch(intersection.type){
            case 'intersecting':
                return true;
            case 'colinear':
                return colinearPointWithinSegment(a[0],a[1],b[0],b[1],b[2],b[3])
                    || colinearPointWithinSegment(a[2],a[3],b[0],b[1],b[2],b[3]);
        }
        return false;
    }
    static calculate(a,b){
        //Determine types of a,b, lines or a curve, error will be thown when source type is not supported
        let typeA=Intersection.__checkType(a), typeB=Intersection.__checkType(b),
            dataA=null, dataB=null;
        if('line'==typeA){
            dataA=Intersection.__getLines(a);
        }else if('curve'==typeA){
            dataA=a.__bezierInstance;
        }
        if('line'==typeB){
            dataB=Intersection.__getLines(b);
        }else if('curve'==typeB){
            dataB=b.__bezierInstance;
        }

        //Data ready, start calculation
        if('line'==typeA && 'line'==typeB){
            for(let lineA of dataA){
                for(let lineB of dataB){
                    if(Intersection.__lineIntersect(lineA,lineB)){
                        return true;
                    }
                }
            }
            return false;
        }
        if('line'==typeA && 'curve'==typeB){
            for(let line of dataA){
                if(dataB.intersects({
                    p1:{
                        x:line[0],
                        y:line[1]
                    },
                    p2:{
                        x:line[2],
                        y:line[3]
                    }
                }).length){
                    return true;
                }
            }
            return false;
        }
        if('curve'==typeA && 'line'==typeB){
            for(let line of dataB){
                if(dataA.intersects({
                    p1:{
                        x:line[0],
                        y:line[1]
                    },
                    p2:{
                        x:line[2],
                        y:line[3]
                    }
                }).length){
                    return true;
                }
            }
            return false;
        }
        if('curve'==typeA && 'curve'==typeB){
            return !!(dataA.intersects(dataB).length);
        }
    }
}
