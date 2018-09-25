
import SBOL2Graph from '../SBOL2Graph';

import S2Identified from './S2Identified'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'
import CompliantURIs from "../SBOL2CompliantURIs";

export default class S2Collection extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Collection
    }

    get members():Array<S2Identified> {

        return this.getUriProperties(Predicates.SBOL2.member)
                   .map((uri:string) => this.graph.uriToFacade(uri))
                   .filter((r:S2Identified) => r !== undefined) as Array<S2Identified>

    }

    addMember(member:S2Identified):void {

        this.graph.add(this.uri, Predicates.SBOL2.member, node.createUriNode(member.uri))

    }

    get containingObject():S2Identified|undefined {

        return undefined

    }


}




