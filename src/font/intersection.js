import { Bezier } from 'bezier-js';
import BoxCollide from 'box-collide';
import {
    checkIntersection,
    colinearPointWithinSegment
  } from 'line-intersect';
import {
    Rect,HorLineTo,VerLineTo,LineTo,CurveTo,QuadCurveTo
} from './path';
export class Intersection{
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
    static __getCurve(src){
        let startPos=src.getPos(), nextPos=src.next();
        if(src instanceof QuadCurveTo){
            return new Bezier([
                {
                    x:startPos.x,
                    y:startPos.y
                },
                {
                    x:src.relative ? src.xStart+src.x0 : src.x0,
                    y:src.relative ? src.yStart+src.y0 : src.y0
                },
                {
                    x:nextPos.x,
                    y:nextPos.y
                },
            ]);
        }else if (src instanceof CurveTo){
            let nextPos=src.next();
            return new Bezier([
                {
                    x:src.xStart,
                    y:src.yStart
                },
                {
                    x:src.relative ? src.xStart+src.x0 : src.x0,
                    y:src.relative ? src.yStart+src.y0 : src.y0
                },
                {
                    x:src.relative ? src.xStart+src.x1 : src.x1,
                    y:src.relative ? src.yStart+src.y1 : src.y1
                },
                {
                    x:nextPos.x,
                    y:nextPos.y
                },
            ]);
        }
    }
    static __lineIntersect(a,b){
        let intersection=checkIntersection(a[0],a[1],a[2],a[3],b[0],b[1],b[2],b[3]);
        if('intersecting'==intersection.type){
            return true;
        }else if('colinear'==intersection.type){
            return colinearPointWithinSegment(a[0],a[1],b[0],b[1],b[2],b[3])
                || colinearPointWithinSegment(a[2],a[3],b[0],b[1],b[2],b[3])
        }
        return false;
    }
    static calculate(a,b){
        if(!(a instanceof PathElement) || !(b instanceof PathElement)){
            throw new TypeError('Intersection calculation only supported between PathElement instances.');
        }

        //Determine types of a,b, lines or a curve, error will be thown when source type is not supported
        let typeA=Intersection.__checkType(a), typeB=Intersection.__checkType(b);
        if('line'==typeA && 'line'==typeB){
            linesA=Intersection.__getLines(a);
            linesB=Intersection.__getLines(b);
            for(let lineA of linesA){
                for(let lineB of linesB){
                    if(Intersection.__lineIntersect(lineA,lineB)){
                        return true;
                    }
                }
            }
            return false;
        }
        if('line'==typeA && 'curve'==typeB){
            linesA=Intersection.__getLines(a);
            curve=Intersection.__getCurve(b);
        }
    }
}