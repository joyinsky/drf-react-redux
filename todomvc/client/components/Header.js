import React, { PropTypes, Component } from 'react';
import TodoTextInput from './TodoTextInput';

export default class Header extends Component {
  static propTypes = {
    add: PropTypes.func.isRequired
  };

  handleSave(text) {
    if (text.length !== 0) {
      this.props.add({text});
    }
  }

  render() {
    return (
      <header className='header'>
          <h1>todos</h1>
          <TodoTextInput newTodo={true}
                         onSave={::this.handleSave}
                         placeholder='What needs to be done?' />
      </header>
    );
  }
}
