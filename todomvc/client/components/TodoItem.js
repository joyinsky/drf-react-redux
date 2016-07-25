import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import TodoTextInput from './TodoTextInput';

export default class TodoItem extends Component {
  static propTypes = {
    todo: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      editing: false
    };
  }

  handleDoubleClick() {
    this.setState({ editing: true });
  }

  handleSave(id, text) {
    if (text.length === 0) {
      this.props.actions.delete(id);
    } else {
      this.props.actions.update(Object.assign({}, this.props.todo, {text: text}));
    }
    this.setState({ editing: false });
  }

  render() {
    const {todo, editTodo, deleteTodo} = this.props;

    let element;
    if (this.state.editing) {
      element = (
        <TodoTextInput text={todo.text}
                       editing={this.state.editing}
                       onSave={(text) => this.handleSave(todo.id, text)} />
      );
    } else {
      element = (
        <div className='view'>
          <input className='toggle'
                 type='checkbox'
                 checked={todo.marked}
                 onChange={() => editTodo(Object.assign({}, todo, {marked: !todo.marked}))} />
          <label onDoubleClick={::this.handleDoubleClick}>
            {todo.text}
          </label>
          <button className='destroy'
                  onClick={() => deleteTodo(todo.id)} />
        </div>
      );
    }

    return (
      <li className={classnames({
        completed: todo.marked,
        editing: this.state.editing
      })}>
        {element}
      </li>
    );
  }
}
