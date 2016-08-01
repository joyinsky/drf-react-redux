import React, { Component, PropTypes } from 'react';
import TodoItem from './TodoItem';


export default class TodoList extends Component {
    static propTypes = {
        todos: PropTypes.array.isRequired,
        actions: PropTypes.object.isRequired
    }

    constructor(props, context) {
        super(props, context);
        this.refresh = this.refresh.bind(this);
    }

    refresh () {
        this.props.actions.fetchMany();
    }

    render() {
        const {todos, actions} = this.props;
        actions.refresh = this.refresh;

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
