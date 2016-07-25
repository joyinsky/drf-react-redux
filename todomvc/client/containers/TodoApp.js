import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Header from '../components/Header';
import MainSection from '../components/MainSection';
import TodoController from '../controllers';

class TodoApp extends Component {
  
  componentDidMount() {
    this.props.actions.fetchMany();
  }
  
  render() {
    const { todos, actions } = this.props;

    return (
      <div>
        <Header add={actions.add} />
      </div>
    );
  }
}

// <MainSection todos={todos} actions={actions} />

function mapState(state) {
  return {
    todos: state.todos.objects
  };
}

function mapDispatch(dispatch) {
  return {
    actions: bindActionCreators(TodoController.functions, dispatch)
  };
}

export default connect(mapState, mapDispatch)(TodoApp);
