
import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";
import { Types, Predicates } from "bioterms";
import { S2ComponentDefinition, S2ModuleDefinition } from "..";

export default class S2Implementation extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Implementation
    }


    get built():S2ComponentDefinition|S2ModuleDefinition|undefined {

        let built = this.getUriProperty(Predicates.SBOL2.built)

        if(!built) {
            return undefined
        }
        
        let builtObj = this.graph.uriToFacade(built)

        if(builtObj instanceof S2ComponentDefinition)
            return builtObj as S2ComponentDefinition

        if(builtObj instanceof S2ModuleDefinition)
            return builtObj as S2ModuleDefinition

        throw new Error('built has wrong type')
    }

    set built(built:S2ComponentDefinition|S2ModuleDefinition|undefined) {

        if(built === undefined) {
            this.deleteProperty(Predicates.SBOL2.built)
        } else {
            this.setUriProperty(Predicates.SBOL2.built, built.uri)
        }
    }

}
