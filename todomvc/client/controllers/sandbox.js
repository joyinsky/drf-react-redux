var URI = require('urijs');

let CALL_API = 'CALL_API';

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

class APIFactory {
    constructor (name, endpoint) {
        this.name = name;
        this.endpoint = URI(endpoint);
        this._constants = {
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
    }

    get actionTypes() {
        return this._constants;
    }

    getTypes (functionName) {
        let constants = this._constants.get(functionName);
        return [constants.request, constants.success, constants.error]
    }

    getDeleteTypes (id) {
        let constants = this._constants.get('delete');
        return [constants.request, {type: constants.success, meta: id}, constants.error]
    }

    getSingleItemURL (id) {
        if (id) {
            return this.endpoint.directory(id)
        } else {
            throw Error('id parameter requiered')
        }

    }

    getUrl (filters={}) {
        return this.endpoint.query(filters);
    }

    getDefaultValues(){
        return this.endpoint.query();
    }

    setDefaultValues(values) {
        return Object.assign(values, this.getDefaultValues());
    }

    fetchMany (filters) {
        return {
            [CALL_API]: {
              endpoint: this.getUrl(filters),
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

class ControllerFactory {
    constructor(name, endpoint) {
        this.name = name;
        this.apiFactory = new APIFactory(this.name, endpoint);
        this._stateConstants = {
            addNew: 'ADD_NEW_' + name.toUpperCase(),
        };
        this._actions = Object.assign({}, this.apiFactory.actionTypes, this._stateConstants);
    }

    get actionTypes () {
        return this._actions;
    }
}

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


function makeReducer(controller) {
    let actions = controller.actionTypes;
    console.log(actions);
    return (state=initialState, action={type: null}) => {
        switch(action.type) {
            /* GET / */
            case actions.fetchMany.request:
                if (action.error || action.payload.name == 'RequestError') {
                    alert('Error al obtener la lista');
                    return Object.assign({}, state, {isFetching: false});
                }
                return Object.assign({}, state, {isFetching: true});
            case actions.fetchMany.success:
                return Object.assign({}, state, {
                    isFetching: false,
                    objects: action.payload
                });
            case actions.fetchMany.error:
                alert('Error al obtener la lista!');
                return Object.assign({}, state, {
                    isFetching: false
                });

            /* POST / */
            case actions.add.request:
                if (action.error || action.payload.name == 'RequestError') {
                    alert('Error al agregar');
                    return Object.assign({}, state, {isAdding: false})
                }
                return Object.assign({}, state, {isAdding: true});
            case actions.add.success:
                state = Object.assign({}, state, {isAdding: false});
                return controller.reducer(state, {type: actions.addNew, object: action.payload})
            case actions.add.error:
                alert("Error al agregar");
                return Object.assign({}, state, {isAdding: false});

            /* GET /:id */
            case actions.fetchOne.request:
                if (action.error || action.payload.name == 'RequestError') {
                    alert("Error al obtener el objeto");
                    return Object.assign({}, state, {isFetching: false});
                }
                return Object.assign({}, state, {isFetching: true});

            case actions.fetchOne.success:
                return Object.assign({}, state, {isFetching: false, single: action.payload});

            case actions.fetchOne.error:
                alert("Error al obtener el objeto");
                return Object.assign({}, state, {isFetching: false});


            /* PATCH /:id */
            case actions.update.request:
                if (action.error || action.payload.name == 'RequestError') {
                    alert("Error al actualizar el objeto");
                    return Object.assign({}, state, {isUpdating: false});
                }
                return Object.assign({}, state, {isUpdating: true});

            case actions.update.success:
                return Object.assign({}, state, {isUpdating: false, single: action.payload});

            case actions.update.error:
                alert("Error al actualizar el objeto");
                return Object.assign({}, state, {isUpdating: false});

            /* DELETE /:id */
            case actions.delete.request:
                if (action.error || action.payload.name == 'RequestError') {
                    alert("Error al borrar el objeto");
                    return Object.assign({}, state, {isDeleting: false});
                }
                return Object.assign({}, state, {isDeleting: true});

            case actions.delete.success:
                return Object.assign({}, state, {isDeleting: false, single: null});

            case actions.delete.error:
                alert("Error al borrar el objeto");
                return Object.assign({}, state, {isDeleting: false});


            /* OPTIONS / */
            case actions.fetchOptions.request:
                if (action.error || action.payload.name == 'RequestError'){
                    alert("Error al obtener las opciones del objeto");
                }
                return state;

            case actions.fetchOptions.success:
                return Object.assign({}, state, {options: action.payload.actions.POST});

            case actions.fetchOptions.error:
                alert('Error al obtener las opciones del objeto');
                return state;


            /* GET /?filters */
            case actions.setFilters:
                let filters = state.filters;
                let newFilters = Object.assign({}, filters, action.filters);
                let newState = Object.assign({}, state, {filters: newFilters});
                return controller.reducer(newState,
                    action={type: actions.fetchMany.request});


            default:
                return state
        }
    }
}

