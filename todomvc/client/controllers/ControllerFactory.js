import { CALL_API, Schemas } from 'redux-api-middleware';
import URI from 'urijs';

const initialState = {
    objects: [],
    single: null,
    options: {},
    pagination: {
        isEnabled: false,
        page: null,
        of: null
    },
    filters: {},
    isFetching: false,
    isAdding: false,
    isUpdating: false,
    isDeleting: false,
    isActing () {
        return (this.isFetching || this.isAdding || this.isUpdating || this.isDeleting);
    }
};


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


        this.getUrl = this.getUrl.bind(this);
        this.getTypes = this.getTypes.bind(this);
        this.getDeleteTypes = this.getDeleteTypes.bind(this);
        this.getSingleItemURL = this.getSingleItemURL.bind(this);
        this.getDefaultValues = this.getDefaultValues.bind(this);
        this.setDefaultValues = this.setDefaultValues.bind(this);

        this.fetchMany = this.fetchMany.bind(this);
        this.fetchOne = this.fetchOne.bind(this);
        this.fetchOptions = this.fetchOptions.bind(this);
        this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.setFilters = this.setFilters.bind(this);


        this.reducer = this.reducer.bind(this);
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
    getUrl (filters = {}) {
        return this.endpoint.query(filters).toString();
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
        let url = this.getUrl(filters)
        return {
            [CALL_API]: {
              endpoint: url,
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
    
    
    reducer (state=initialState, action={type: 'default'})  {
        switch(action.type) {
            /* GET / */
            case this.actionTypes.fetchMany.request:
                if (action.error) {
                    alert('Error al obtener la lista');
                    return Object.assign({}, state, {isFetching: false});
                }
                return Object.assign({}, state, {isFetching: true});
            case this.actionTypes.fetchMany.success:
                return Object.assign({}, state, {
                    isFetching: false,
                    objects: action.payload
                });
            case this.actionTypes.fetchMany.error:
                alert('Error al obtener la lista!');
                return Object.assign({}, state, {
                    isFetching: false
                });

            /* POST / */
            case this.actionTypes.add.request:
                if (action.error) {
                    alert('Error al agregar');
                    return Object.assign({}, state, {isAdding: false})
                }
                return Object.assign({}, state, {isAdding: true});
            case this.actionTypes.add.success:
                return Object.assign({}, state, {isAdding: false, objects: [...state.objects, action.payload]});

            case this.actionTypes.add.error:
                alert("Error al agregar");
                return Object.assign({}, state, {isAdding: false});

            /* GET /:id */
            case this.actionTypes.fetchOne.request:
                if (action.error) {
                    alert("Error al obtener el objeto");
                    return Object.assign({}, state, {isFetching: false});
                }
                return Object.assign({}, state, {isFetching: true});

            case this.actionTypes.fetchOne.success:
                return Object.assign({}, state, {isFetching: false, single: action.payload});


            case this.actionTypes.fetchOne.error:
                alert("Error al obtener el objeto");
                return Object.assign({}, state, {isFetching: false});


            /* PATCH /:id */
            case this.actionTypes.update.request:
                if (action.error) {
                    alert("Error al actualizar el objeto");
                    return Object.assign({}, state, {isUpdating: false});
                }
                return Object.assign({}, state, {isUpdating: true});

            case this.actionTypes.update.success:
                return Object.assign({}, state, {isUpdating: false, single: action.payload});

            case this.actionTypes.update.error:
                alert("Error al actualizar el objeto");
                return Object.assign({}, state, {isUpdating: false});

            /* DELETE /:id */
            case this.actionTypes.delete.request:
                if (action.error) {
                    alert("Error al borrar el objeto");
                    return Object.assign({}, state, {isDeleting: false});
                }
                return Object.assign({}, state, {isDeleting: true});

            case this.actionTypes.delete.success:
                return Object.assign({}, state, {isDeleting: false, single: null});

            case this.actionTypes.delete.error:
                alert("Error al borrar el objeto");
                return Object.assign({}, state, {isDeleting: false});


            /* OPTIONS / */
            case this.actionTypes.fetchOptions.request:
                if (action.error){
                    alert("Error al obtener las opciones del objeto");
                }
                return state;

            case this.actionTypes.fetchOptions.success:
                return Object.assign({}, state, {options: action.payload.this.actionTypes.POST});

            case this.actionTypes.fetchOptions.error:
                alert('Error al obtener las opciones del objeto');
                return state;


            /* GET /?filters */
            case this.actionTypes.setFilters:
                return state


            default:
                return state
        }
    }

}

export default ControllerFactory;