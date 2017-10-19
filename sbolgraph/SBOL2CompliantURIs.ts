
import SBOL2Graph from "./SBOL2Graph";
import S2ComponentInstance from "./sbol2/S2ComponentInstance";
import * as triple from './triple'
import S2ComponentDefinition from "./sbol2/S2ComponentDefinition";
import { Predicates, Types, Specifiers } from "sbolterms";
import assert from 'power-assert'
import S2SequenceAnnotation from "./sbol2/S2SequenceAnnotation";
import S2Location from "./sbol2/S2Location";

export default class CompliantURIs {

    static getComponentDefinitionUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        return topLevelPrefix + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getComponentUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingComponent =
            new S2ComponentInstance(graphA, uri)

        const containingComponentDefinition:S2ComponentDefinition =
            existingComponent.containingComponentDefinition

        if(containingComponentDefinition === undefined) {

            throw new Error('Component ' + uri + ' not contained by a ComponentDefinition?')

        }

        const containingComponentDefinitionNewUri =
                    CompliantURIs.getComponentDefinitionUri(
                        graphA, containingComponentDefinition.uri, topLevelPrefix, false)

        return containingComponentDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getSequenceAnnotationUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingSA =
            new S2SequenceAnnotation(graphA, uri)

        const containingComponentDefinition:S2ComponentDefinition =
            existingSA.containingComponentDefinition

        if(existingSA === undefined) {

            throw new Error('SequenceAnnotation ' + uri + ' not contained by a ComponentDefinition?')

        }

        const containingComponentDefinitionNewUri =
                    CompliantURIs.getComponentDefinitionUri(
                        graphA, containingComponentDefinition.uri, topLevelPrefix, false)

        return containingComponentDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getLocationUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const existingLocation = graphA.uriToFacade(uri)

        if(! (existingLocation instanceof S2Location)) {
            throw new Error('???')
        }

        const containingSA:S2SequenceAnnotation =
            (existingLocation as S2Location).containingSequenceAnnotation

        if(containingSA === undefined) {

            throw new Error('Location ' + uri + ' not contained by a SequenceAnnotation?')

        }

        const containingSANewUri =
                    CompliantURIs.getSequenceAnnotationUri(
                        graphA, containingSA.uri, topLevelPrefix, false)

        return containingSANewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getFunctionalComponentUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingModuleDefinition:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOL2.functionalComponent, uri)
        )

        if(containingModuleDefinition === undefined) {

            throw new Error('FunctionalComponent ' + uri + ' not contained by a ModuleDefinition?')

        }

        const containingModuleDefinitionNewUri =
                    CompliantURIs.getModuleDefinitionUri(
                        graphA, containingModuleDefinition, topLevelPrefix, false)

        return containingModuleDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getInteractionUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingModuleDefinition:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOL2.interaction, uri)
        )

        if(containingModuleDefinition === undefined) {

            throw new Error('Interaction ' + uri + ' not contained by a ModuleDefinition?')

        }

        const containingModuleDefinitionNewUri =
                    CompliantURIs.getModuleDefinitionUri(
                        graphA, containingModuleDefinition, topLevelPrefix, false)

        return containingModuleDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getModuleDefinitionUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        return topLevelPrefix + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getModuleUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingModuleDefinition:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOL2.module, uri)
        )

        if(containingModuleDefinition === undefined) {

            throw new Error('Module ' + uri + ' not contained by a ModuleDefinition?')

        }

        const containingModuleDefinitionNewUri =
                    CompliantURIs.getModuleDefinitionUri(
                        graphA, containingModuleDefinition, topLevelPrefix, false)

        return containingModuleDefinitionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getParticipationUri(graphA:SBOL2Graph, uri:string, topLevelPrefix:string, withVersion:boolean) {

        if(!graphA.hasMatch(uri, null, null))
            return uri

        const containingInteraction:string|undefined = triple.subjectUri(
            graphA.matchOne(null, Predicates.SBOL2.participation, uri)
        )

        if(containingInteraction === undefined) {

            throw new Error('Participation ' + uri + ' not contained by an Interaction?')

        }

        const containingInteractionNewUri =
                    CompliantURIs.getInteractionUri(
                        graphA, containingInteraction, topLevelPrefix, false)

        return containingInteractionNewUri
                    + '/' + CompliantURIs.removePrefix(graphA, uri, withVersion)

    }

    static getPrefix(uri:string):string {

        const tokens:string[] = uri.split('/')

        return tokens.slice(0, tokens.length - 2).join('/') + '/'

    }

    static getDisplayId(uri:string):string {

        const tokens:string[] = uri.split('/')

        return tokens[tokens.length - 2]

    }

    static getVersion(uri:string):string {

        const tokens:string[] = uri.split('/')

        return tokens[tokens.length - 1]

    }

    static getPersistentIdentity(uri:string):string {

        return uri.slice(0, uri.lastIndexOf('/'))
    
    }

    static removePrefix(graph:SBOL2Graph, uri:string, keepVersion:boolean) {

        const prefix = CompliantURIs.getPrefix(uri)

        const uriWithoutPrefix = uri.substr(prefix.length)

        if(keepVersion === false) {

            const version: string | undefined = triple.objectUri(
                graph.matchOne(uri, Predicates.SBOL2.version, null)
            )

            if(version !== undefined) {

                if(!uriWithoutPrefix.endsWith('/' + version)) {
                    throw new Error('no version suffix?')
                }

                if(uriWithoutPrefix.startsWith('/'))
                    throw new Error('???')

                return uriWithoutPrefix.substr(0, uriWithoutPrefix.length - version.length - 1)

            }

        }

        if(uriWithoutPrefix.startsWith('/'))
            throw new Error('???')

        return uriWithoutPrefix

    }

    static getTopLevelPrefixFromSubject(graph:SBOL2Graph, subject:string) {

        const closestTopLevel:string|undefined = graph.findClosestTopLevel(subject)

        if(closestTopLevel === undefined)
            throw new Error('no closest top level?')

        return CompliantURIs.getPrefix(closestTopLevel)
    }

    static checkCompliance(graph:SBOL2Graph) {

        const diff:any[] = []

        graph.match(null, Predicates.a, Types.SBOL2.ComponentDefinition)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getComponentDefinitionUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.ModuleDefinition)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getModuleDefinitionUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.Module)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getModuleUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.Component)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getComponentUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.FunctionalComponent)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getFunctionalComponentUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.Interaction)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getInteractionUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        graph.match(null, Predicates.a, Types.SBOL2.Participation)
            .map(triple.subjectUri)
            .forEach((uri:string) => {

            const topLevelPrefix = CompliantURIs.getTopLevelPrefixFromSubject(graph, uri)

            const compliantUri = CompliantURIs.getParticipationUri(graph, uri, topLevelPrefix, true)

            if(uri !== compliantUri)
                diff.push({ oldUri: uri, newUri: compliantUri, topLevelPrefix: topLevelPrefix })
        })

        return diff
    }

}