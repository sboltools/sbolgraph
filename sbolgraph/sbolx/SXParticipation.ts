import { SBOLXGraph } from '..';

import SXIdentified from './SXIdentified'
import SXSubModule from './SXSubModule'
import SXInteraction from './SXInteraction'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'

export default class SXParticipation extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Participation
    }

    get participant():SXSubModule|undefined {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOLX.participant)

        if(uri) {
            return new SXSubModule(this.graph, uri)
        }
    }

    get interaction():SXInteraction|undefined {

        const uri:string|undefined = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasParticipation, this.uri)
        )

        if(uri) {
            return new SXInteraction(this.graph, uri)
        }

    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasParticipation, this.uri)
        )

        if(!uri) {
            throw new Error('Participation has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    hasRole(uri:string):boolean {

        return this.graph.hasMatch(this.uri, Predicates.SBOLX.hasRole, uri)
    
    }

}


