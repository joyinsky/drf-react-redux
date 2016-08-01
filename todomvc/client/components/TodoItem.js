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
      this.props.actions.remove(id);
    } else {
      this.props.actions.update({id: id, text: text});
    }
    this.setState({ editing: false });
  }

  handleMarked(todo) {
    console.log();
    this.props.actions.update({marked: !todo.marked, id: todo.id});
    this.props.actions.refresh();
  }

  handleDelete(todo) {
    console.log(this.props.actions);
    this.props.actions.remove(todo.id);
    this.props.actions.refresh();
  }

  render() {
    const todo = this.props.todo;

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
                 onChange={() => this.handleMarked(todo)} />
          <label onDoubleClick={::this.handleDoubleClick}>
            {todo.text}
          </label>
          <button className='destroy'
                  onClick={() => this.handleDelete(todo)} />
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
