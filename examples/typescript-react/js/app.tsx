/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/

declare var Router;
import * as React from "react";
import * as ReactDOM from "react-dom";
import { TodoModel, Todo, AppView, Tab } from "./todoModel";
import { TodoFooter } from "./footer";
import { TodoItem } from "./todoItem";
import { ALL_TODOS, ACTIVE_TODOS, COMPLETED_TODOS, ENTER_KEY } from "./constants";

interface Props {
  model : TodoModel;
}

class TodoApp extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props);
  }

  public componentDidMount() {
    var router = Router({
      '/': () => this.props.model.setSelectedTab('ALL'),
      '/active': () => this.props.model.setSelectedTab('ACTIVE'),
      '/completed': () => this.props.model.setSelectedTab('COMPLETED'),
    });
    router.init('/');
  }

  public handleNewTodoKeyDown(event : React.KeyboardEvent) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }

    event.preventDefault();

    const val: string = (ReactDOM.findDOMNode(this.refs["newField"]) as HTMLInputElement).value.trim();

    if (val) {
      this.props.model.addTodo(val);
      (ReactDOM.findDOMNode(this.refs["newField"]) as HTMLInputElement).value = '';
    }
  }

  public toggleAll(event : React.FormEvent) {
    var target : any = event.target;
    var checked = target.checked;
    this.props.model.toggleAll(checked);
  }

  public render() {
    const view = this.props.model.getView();

    var todoItems = view.todos.map((todo) => {
      return (
        <TodoItem
          key={todo.id}
          model={this.props.model}
          todo={todo}
        />
      );
    });

    let footer;
    if (view.showFooter) {
      footer =
        <TodoFooter
          model={this.props.model}
          activeCount={view.activeCount}
          completedCount={view.completedCount}
          selectedTab={view.selectedTab}
        />;
    }

    let main;
    if (view.showMain) {
      main = (
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            onChange={ e => this.toggleAll(e) }
            checked={view.activeCount === 0}
          />
          <label
            htmlFor="toggle-all"
          >
            Mark all as complete
          </label>
          <ul className="todo-list">
            {todoItems}
          </ul>
        </section>
      );
    }

    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          <input
            ref="newField"
            className="new-todo"
            placeholder="What needs to be done?"
            onKeyDown={ e => this.handleNewTodoKeyDown(e) }
            autoFocus={true}
          />
        </header>
        {main}
        {footer}
        <section className="total-time-spent">
          <p>Total Time Spent: {view.totalTimeSpent} seconds.</p>
          <button
            onClick={() => {this.updatePomodoroSettings('https://jsonkeeper.com/b/8EWN');}}
          >
            Load Peter's Pomodoro Profile
          </button>
          <button
            onClick={() => {this.updatePomodoroSettings('https://jsonkeeper.com/b/0J1X');}}
          >
            Load Paula's Pomodoro Profile
          </button>
        </section>
      </div>
    );
  }

  private updatePomodoroSettings(url: string) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.props.model.updatePomodoroSettings(
          {workTime: data.settings.work, restTime: data.settings.rest}
        )
      })
  }
}

var model = new TodoModel('react-todos');

function render() {
  ReactDOM.render(
    <TodoApp model={model}/>,
    document.getElementsByClassName('todoapp')[0]
  );
}

model.subscribe(render);
render();
setInterval(() => {model.tick()}, 1000);

(window as any).model = model;
