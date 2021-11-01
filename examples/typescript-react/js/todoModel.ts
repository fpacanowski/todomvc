/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

/// <reference path="./interfaces.d.ts"/>

import { Utils } from "./utils";

type ModelCallback = () => void;


export type Tab = 'ALL' | 'ACTIVE' | 'COMPLETED';

export type AppView = {
  selectedTab: Tab;
  todos: Array<ITodo>;
  activeCount: number;
  completedCount: number;
  showMain: boolean;
  showFooter: boolean;
};

// Generic "model" object. You can use whatever
// framework you want. For this application it
// may not even be worth separating this logic
// out, but we do this to demonstrate one way to
// separate out parts of your application.
class TodoModel implements ITodoModel {

  public key : string;
  public todos : Array<ITodo>;
  public onChanges : Array<ModelCallback>;
  public selectedTab: Tab;

  constructor(key: string) {
    this.key = key;
    this.todos = Utils.store(key);
    this.onChanges = [];
    this.selectedTab = 'ALL';
  }

  public subscribe(onChange: ModelCallback) {
    this.onChanges.push(onChange);
  }

  public inform() {
    Utils.store(this.key, this.todos);
    this.onChanges.forEach(function (cb) { cb(); });
  }

  public addTodo(title : string) {
    this.todos = this.todos.concat({
      id: Utils.uuid(),
      title: title,
      completed: false
    });

    this.inform();
  }

  public toggleAll(checked : Boolean) {
    // Note: It's usually better to use immutable data structures since they're
    // easier to reason about and React works very well with them. That's why
    // we use map(), filter() and reduce() everywhere instead of mutating the
    // array or todo items themselves.
    this.todos = this.todos.map<ITodo>((todo : ITodo) => {
      return Utils.extend({}, todo, {completed: checked});
    });

    this.inform();
  }

  public toggle(todoToToggle : ITodo) {
    this.todos = this.todos.map<ITodo>((todo : ITodo) => {
      return todo !== todoToToggle ?
        todo :
        Utils.extend({}, todo, {completed: !todo.completed});
    });

    this.inform();
  }

  public destroy(todo : ITodo) {
    this.todos = this.todos.filter(function (candidate) {
      return candidate !== todo;
    });

    this.inform();
  }

  public save(todoToSave : ITodo, text : string) {
    this.todos = this.todos.map(function (todo) {
      return todo !== todoToSave ? todo : Utils.extend({}, todo, {title: text});
    });

    this.inform();
  }

  public clearCompleted() {
    this.todos = this.todos.filter(function (todo) {
      return !todo.completed;
    });

    this.inform();
  }

  public setSelectedTab(tab: Tab) {
    this.selectedTab = tab;
    this.inform();
  }

  public getView(): AppView {
    const shownTodos = this.todos.filter((todo) => {
      switch (this.selectedTab) {
        case 'ALL':
          return true;
        case 'ACTIVE':
          return !todo.completed;
        case 'COMPLETED':
          return todo.completed;
      }
    });

    const activeCount = this.todos.reduce(function (accum, todo) {
      return todo.completed ? accum : accum + 1;
    }, 0);

    const completedCount = this.todos.length - activeCount;

    return {
      selectedTab: this.selectedTab,
      todos: shownTodos,
      activeCount,
      completedCount,
      showMain: shownTodos.length > 0,
      showFooter: (activeCount > 0) || (completedCount > 0)
    };
  }

}

export { TodoModel };
