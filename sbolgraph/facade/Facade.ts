
import * as triple from '../triple'
import * as node from '../node'

import { Predicates } from 'terms'
import SbolGraph from "../SbolGraph";
import { Watcher } from "sbolgraph/Graph";

export default abstract class Facade {

    graph: SbolGraph
    uri: string

    constructor(graph:SbolGraph, uri:string) {

        this.graph = graph
        this.uri = uri

    }

    getProperty(predicate) {
        return this.graph.matchOne(this.uri, predicate, null)
    }

    getUriProperty(predicate):string|undefined {
        return triple.objectUri(this.getProperty(predicate))
    }

    getStringProperty(predicate):string|undefined {
        return triple.objectString(this.getProperty(predicate))
    }

    getIntProperty(predicate):number|undefined {
        return triple.objectInt(this.getProperty(predicate))
    }

    getBoolProperty(predicate):boolean|undefined {
        return triple.objectBool(this.getProperty(predicate))
    }

    getFloatProperty(predicate):number|undefined {
        return triple.objectFloat(this.getProperty(predicate))
    }



    getProperties(predicate) {
        return this.graph.match(this.uri, predicate, null)
    }

    getUriProperties(predicate): Array<string> {
        return this.getProperties(predicate).map(triple.objectUri).filter((el) => !!el) as Array<string>
    }

    getStringProperties(predicate): Array<string|undefined> {
        return this.getProperties(predicate).map(triple.objectString).filter((el) => !!el) as Array<string>
    }



    setProperty(predicate:string, object:any) {
        this.graph.removeMatches(this.uri, predicate, null)
        this.graph.insert(this.uri, predicate, object)
    }

    deleteProperty(predicate:string) {
        this.graph.removeMatches(this.uri, predicate, null)
    }

    setUriProperty(predicate:string, value:string|undefined) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createUriNode(value))
        }
    }

    setStringProperty(predicate:string, value:string|undefined) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createStringNode(value))
        }
    }

    setIntProperty(predicate:string, value:number) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createIntNode(value))
        }
    }

    setBoolProperty(predicate:string, value:boolean) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createBoolNode(value))
        }
    }

    setFloatProperty(predicate:string, value:number) {

        if(value === undefined) {
            this.deleteProperty(predicate)
        } else {
            this.setProperty(predicate, node.createFloatNode(value))
        }
    }


    get objectType():string|undefined {
        return this.getUriProperty(Predicates.a)
    }

    abstract get facadeType():string

    hasCorrectTypePredicate():boolean {

        return this.objectType === this.facadeType

    }


    watch(cb:() => void):Watcher {

        return this.graph.watchSubject(this.uri, cb)

    }

}
