import { CALL_API, Schemas } from 'redux-api-middleware';
import URI from 'urijs';


function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

var csrftoken = getCookie('csrftoken');


class ControllerFactory {
    constructor (name, endpoint) {
        this._name = name;
        this.endpoint = URI(endpoint);

        this.getUrl = (filters = {}) => {return this.endpoint.query(filters).toString();};


        this.actionTypes = {
            fetchMany: {
                request: 'FETCHMANY_' + this.name.toUpperCase() + '_REQUEST',
                success: 'FETCHMANY_' + this.name.toUpperCase() + '_SUCCESS',
                error: 'FETCHMANY_' + this.name.toUpperCase() + '_ERROR'
            },
            fetchOne: {
                request: 'FETCHONE_' + this.name.toUpperCase() + '_REQUEST',
                success: 'FETCHONE_' + this.name.toUpperCase() + '_SUCCESS',
                error: 'FETCHONE_' + this.name.toUpperCase() + '_ERROR'
            },
            fetchOptions: {
                request: 'OPTIONS_' + this.name.toUpperCase() + '_REQUEST',
                success: 'OPTIONS_' + this.name.toUpperCase() + '_SUCCESS',
                error: 'OPTIONS_' + this.name.toUpperCase() + '_ERROR'
            },
            add: {
                request: 'ADD_' + this.name.toUpperCase() + '_REQUEST',
                success: 'ADD_' + this.name.toUpperCase() + '_SUCCESS',
                error: 'ADD_' + this.name.toUpperCase() + '_ERROR'
            },
            update: {
                request: 'UPDATE_' + this.name.toUpperCase() + '_REQUEST',
                success: 'UPDATE_' + this.name.toUpperCase() + '_SUCCESS',
                error: 'UPDATE_' + this.name.toUpperCase() + '_ERROR'
            },
            delete: {
                request: 'DELETE_' + this.name.toUpperCase() + '_REQUEST',
                success: 'DELETE_' + this.name.toUpperCase() + '_SUCCESS',
                error: 'DELETE_' + this.name.toUpperCase() + '_ERROR'
            },
            setFilters: 'SET_' + this.name.toUpperCase() + '_FILTER'
        };

        // this.fetchMany.bind(this);
    }

    get name () {
        return this._name
    }

    get functions () {
        return {
            'fetchMany': this.fetchMany,
            'fetchOne': this.fetchOne,
            'add': this.add,
            'update': this.update,
            'delete': this.delete,
            'setFilters': this.setFilters,
        }
    }

    getTypes (functionName) {
        let constants = this.actionTypes[functionName];
        return [constants.request, constants.success, constants.error]
    }

    getDeleteTypes (id) {
        let constants = this.actionTypes['delete'];
        return [constants.request, {type: constants.success, meta: id}, constants.error]
    }

    getSingleItemURL (id) {
        if (id) {
            return this.endpoint.directory(id)
        } else {
            throw Error('id parameter requiered')
        }

    }

    getDefaultValues(){
        return this.endpoint.query();
    }

    setDefaultValues(values) {
        return Object.assign(values, this.getDefaultValues());
    }

    fetchMany (filters = {}) {
        return {
            [CALL_API]: {
              endpoint: this.getUrl(),
              method: 'GET',
              types: this.getTypes('fetchMany'),
              // headers: {"X-CSRFToken": csrftoken},
              credentials: 'same-origin'
            }
        }
    }

    fetchOptions () {
        return {
            [CALL_API]: {
              endpoint: this.getUrl(),
              method: 'OPTIONS',
              types: this.getTypes('fetchOptions'),
              // headers: {"X-CSRFToken": csrftoken},
              credentials: 'same-origin'
            }
        }
    }

    fetchOne (id) {
        return {
            [CALL_API]: {
              endpoint: this.getSingleItemURL(id),
              method: 'OPTIONS',
              types: this.getTypes('fetchOne'),
              // headers: {"X-CSRFToken": csrftoken},
              credentials: 'same-origin'
            }
        }
    }

    add (values) {
        let updatedValues = this.setDefaultValues(values);
        return {
            [CALL_API]: {
                endpoint: this.getUrl(),
                method: 'POST',
                body: JSON.stringify(updatedValues),
                types: this.getTypes('add'),
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": getCookie('csrftoken')
                },
                credentials: 'same-origin'
            }
        }
    }

    update (values) {
        let updatedValues = this.setDefaultValues(values);
        return {
            [CALL_API]: {
                endpoint: this.getSingleItemURL(values.id),
                method: 'PATCH',
                body: JSON.stringify(updatedValues),
                types: this.getTypes('update'),
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": getCookie('csrftoken')
                },
                credentials: 'same-origin'
            }
        }
    }

    delete (id) {
        return {
            [CALL_API]: {
                endpoint: this.getSingleItemURL(id),
                method: 'DELETE',
                types: this.getDeleteTypes(id),
                headers: {
                    'Content-Type': 'application/json',
                    "X-CSRFToken": getCookie('csrftoken')
                },
                credentials: 'same-origin'
            }
        }
    }

    setFilters(filters) {
        return {
            action: this.actionTypes.setFilters,
            filters: filters
        }
    }
}

export default ControllerFactory;