import React, { Component, PropTypes } from 'react';
import TodoItem from './TodoItem';


export default class TodoList extends Component {
    static propTypes = {
        todos: PropTypes.array.isRequired,
        actions: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {todos, actions} = this.props;

        return (
            <section className="main">
                <ul className="todo-list">
                    {todos.map(todo =>
                    <TodoItem todo={todo} actions={actions} key={todo.id}/>
                    )}
                </ul>
            </section>
        )
    }
}
