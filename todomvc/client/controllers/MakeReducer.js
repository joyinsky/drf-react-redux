
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


export default function MakeReducer(controller) {
    let actions = controller.actionTypes;
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

