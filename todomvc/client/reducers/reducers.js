import TodoController from '../controllers';
import MakeReducer from '../controllers/MakeReducer';


let reducers = {todos: MakeReducer(TodoController)};

export default reducers;