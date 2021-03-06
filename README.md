A library for the Synthetic Biology Open Language (SBOL) written in TypeScript, for JavaScript/TypeScript applications in the browser or node.js.  Also ported to [Python](https://github.com/udp/pysbolgraph).

Unlike existing libraries such as libSBOLj and sboljs, sbolgraph does not attempt to "load" SBOL RDF into an object oriented datastructure.  Instead, sbolgraph keeps the SBOL RDF in an RDF graph, and provides "facade" classes that look like class instances but actually just wrap a URI and query/update the graph in their getters/setters.

sbolgraph is built on [rdfoo](https://github.com/udp/rdfoo), a library for creating object oriented RDF abstractions in TypeScript.  It can therefore be used in conjunction with other rdfoo abstractions.  For example, the PROV-O abstraction used by sbolgraph is provided by [rdfoo-prov](https://github.com/udp/rdfoo-prov).

[Example project using webpack](https://github.com/udp/sbolgraph_example)

# Implemented so far

* Reading and writing SBOL1, SBOL2, and SBOL3
* Converting between SBOL1, SBOL2, and SBOL3
* Reading (converting) FASTA and GenBank


# Not implemented so far

* Writing FASTA and GenBank
* Validation



# Advantages of sbolgraph


## Bi-directional properties

In sbolgraph, the bi-directional nature of RDF predicates is inherently preserved.  For example, for the following fragment of SBOL:

	<http://example.com/cd> a sbol:ComponentDefinition ;
		sbol:component <http://example.com/cd/subcomponent1> .

	<http://example.com/cd/subcomponent1> a sbol:Component .

It is possible both to list the subcomponents of the `ComponentDefinition` by evaluating the partial triple `(<http://example.com/cd> sbol:component ?)`, and also to find the containing `ComponentDefinition` of a subcomponent with `(? sbol:component <http://example.com/cd>)`.

This comes naturally when the SBOL is accessed through an RDF graph structure.  However, if the SBOL is stored in a class structure, for example:

	class ComponentDefinition {
		Array<Component> subcomponents
	}

It would be necessary to store and maintain an explicit backreference to the `ComponentDefinition` when deserializing and mutating SBOL:

	class Component {
		ComponentDefinition* containingComponentDefinition;
	}

sbolgraph avoids this by maintaining the graph and using accessors to query it, as in:

	class ComponentDefinition {

		string uri

		get subcomponents {
			return match(this.uri, sbol:component, ?)
		}
	}

	class Component {

		string uri

		get containingComponentDefinition {
			return match(?, sbol:component, this.uri)
		}
	}


## No [de]serialization logic

sbolgraph doesn't need methods to load or save from an RDF graph.  Instead, standard routines to serialize/deserialize an RDF graph can be used, because the graph is the only state.   This means that:

* Properties can be changed/added in classes without having to modify save/load logic
* A whole category of serialization bugs is avoided



# Performance

Is this going to be slower than the other libraries?

Marginally, but hopefully not significantly, and certainly not in time complexity terms.  All of the predefined partial triple evaluations in the library are hash table lookups facilitated by a [fork of rdf-graph-array](https://github.com/udp/rdf-graph-array) with additional indexing.  Hash table lookups should be O(1).

