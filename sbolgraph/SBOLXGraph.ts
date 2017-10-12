
import Graph from './Graph'

import { Types, Predicates, Specifiers } from 'sbolterms'

import * as triple from './triple'
import * as node from './node'

import RdfGraphArray = require('rdf-graph-array')
import RdfParserXml = require('rdf-parser-rdfxml')
import XMLSerializer = require('rdf-serializer-xml')

import request = require('request')

import assert from 'power-assert'

import {
    SXIdentified,
    SXSequence,
    SXModule,
    SXSubModule,
    SXOrientedLocation,
    SXSequenceFeature,
    SXLocation,
    SXRange,
    SXParticipation,
    SXInteraction,
    SXCollection
} from '.'

import SXIdentifiedFactory from './sbolx/SXIdentifiedFactory'

export default class SBOLXGraph extends Graph {

    depthCache: Object
    _cachedUriPrefixes: Array<string>|null

    constructor(rdfGraph?:any) {

        super(rdfGraph)

        this.depthCache = {}

        this._cachedUriPrefixes = null

    }

    clone():SBOLXGraph {

        return new SBOLXGraph(this.graph.toArray())

    }

    createModule(uriPrefix:string, id:string, version?:string):SXModule {

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOLX.Module, uriPrefix, id, undefined, version)

        return new SXModule(this, identified.uri)

    }

    createCollection(uriPrefix:string, id:string, version?:string):SXCollection {

        const identified:SXIdentified =
            SXIdentifiedFactory.createTopLevel(this, Types.SBOLX.Collection, uriPrefix, id, undefined, version)

        return new SXCollection(this, identified.uri)

    }

    get sequences():Array<SXSequence> {

        return this.instancesOfType(Types.SBOLX.Sequence)
                    .map((uri) => new SXSequence(this, uri))

    }

    get modules():Array<SXModule> {

        return this.instancesOfType(Types.SBOLX.Module)
                    .map((uri) => new SXModule(this, uri))

    }

    get rootModules():Array<SXModule> {

        return this.instancesOfType(Types.SBOL2.ComponentDefinition).filter((uri) => {
            return !this.hasMatch(null, Predicates.SBOLX.instanceOf, uri)
        }).map((uri) => new SXModule(this, uri))

    }

    static loadURL(url) {

        return new Promise((resolve, reject) => {

            console.log('requesting ' + url)

            request.get(url, (err, res, body) => {

                if(err) {
                    reject(err)
                    return
                }

                console.log('headerz')
                console.log(JSON.stringify(res.headers))

                var mimeType = res.headers['content-type']

                if(mimeType === undefined)
                    mimeType = 'application/rdf+xml'

                resolve({
                    mimeType: mimeType,
                    data: body
                })


            })

        }).then((res:any) => {

            var { data, mimeType } = res

            console.log('SBOLXGraph::loadURL: mimetype is ' + mimeType)

            if(mimeType === 'text/xml')
                mimeType = 'application/rdf+xml'

            if(mimeType === 'application/xml')
                mimeType = 'application/rdf+xml'

            const parser = new RdfParserXml()

            return parser.parse(data).then((graph) => {

                return Promise.resolve(new SBOLXGraph(graph))

            })

        })

    }

    static loadString(data:string, mimeType:string):Promise<SBOLXGraph> {

        const parser = new RdfParserXml()

        return parser.parse(data).then((graph) => {

            return Promise.resolve(new SBOLXGraph(graph))

        })

    }

    serializeXML() {

        const serializer = new XMLSerializer()

        return serializer.serialize(this.graph)
    }

    // TODO
    //
    get topLevels():Array<SXIdentified> {

        const topLevels = []

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOLX.Module)
                .map(triple.subjectUri))

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOLX.Sequence)
                .map(triple.subjectUri))

        Array.prototype.push.apply(topLevels,
            this.match(null, Predicates.a, Types.SBOLX.Collection)
                .map(triple.subjectUri))

        return topLevels.map((topLevel) => this.uriToFacade(topLevel) as SXIdentified)
    }


    get uriPrefixes():Array<string> {

        if(this._cachedUriPrefixes !== null)
            return this._cachedUriPrefixes

        const topLevels = this.topLevels

        var prefixes = {}

        topLevels.forEach((topLevel) => {

            const prefix = topLevel.uriPrefix

            if(prefixes[prefix] === undefined)
                prefixes[prefix] = true

        })

        this._cachedUriPrefixes = Object.keys(prefixes)

        return this._cachedUriPrefixes
    }

    getTopLevelsWithPrefix(prefix) {

        const topLevels = this.topLevels

        return this.topLevels.filter((topLevel) => {

            return topLevel.uri.indexOf(prefix) === 0

        })
    }

    uriToFacade(uri:string):SXIdentified|undefined {

        if(!uri)
            return undefined

        const types = this.getTypes(uri)

        for(var i = 0; i < types.length; ++ i) {

            let type = types[i]

            if(type === Types.SBOLX.Module)
                return new SXModule(this, uri)

            if(type === Types.SBOLX.SubModule)
                return new SXSubModule(this, uri)

            if(type === Types.SBOLX.Interaction)
                return new SXInteraction(this, uri)

            if(type === Types.SBOLX.Participation)
                return new SXParticipation(this, uri)

            if(type === Types.SBOLX.Range)
                return new SXRange(this, uri)

            if(type === Types.SBOLX.OrientedLocation)
                return new SXOrientedLocation(this, uri)

            if(type === Types.SBOLX.SequenceFeature)
                return new SXSequenceFeature(this, uri)

            if(type === Types.SBOLX.Sequence)
                return new SXSequence(this, uri)

            if(type === Types.SBOLX.Collection)
                return new SXCollection(this, uri)

            throw new Error('unknown type: ' + uri)
        }

        //return undefined
    }

    addAll(otherGraph:SBOLXGraph) {

        this.graph.addAll(otherGraph.graph)

    }

    add(s:any, p:any, o:any) {

        console.log(arguments)

        if(typeof s === 'string') {
            s = node.createUriNode(s)
        }

        if(typeof p === 'string') {
            p = node.createUriNode(p)
        }

        this.graph.add({
            subject: s,
            predicate: p,
            object: o
        })

    }

    findClosestTopLevel(_subject:string):string|undefined {

        var subject:string|undefined = _subject

        const origSubject:string = subject

        var subjectTypes:string[] = this.getTypes(subject)

        while(!isTopLevel()) {

            let identified:SXIdentified|undefined = this.uriToFacade(subject)

            if(identified === undefined)
                throw new Error('???')

            identified = identified.containingObject

            if(identified === undefined) {
                return undefined
            }

            subject = identified.uri

            subjectTypes = this.getTypes(subject)
        }

        return subject


        function isTopLevel() {

           // TODO
            return subjectTypes.indexOf(Types.SBOLX.Module) !== -1
                    || subjectTypes.indexOf(Types.SBOLX.Sequence) !== -1
        }    


    }

    nameToDisplayId(name:string):string {

        return name.replace(/\s/, '_')

    }




}




