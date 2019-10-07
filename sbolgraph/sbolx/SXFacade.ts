

import { Facade } from 'rdfoo'
import SBOLXGraph from '../SBOLXGraph';

export default abstract class SXFacade extends Facade {

    get graph() {

        return this._graph as SBOLXGraph

    }


}