/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */

import { Utils } from "./utils";

type ModelCallback = () => void;


export type Tab = 'ALL' | 'ACTIVE' | 'COMPLETED';

export type AppView = {
  selectedTab: Tab;
  todos: Array<Todo>;
  activeCount: number;
  completedCount: number;
  showMain: boolean;
  showFooter: boolean;
};

export type Todo = {
  id: string,
  title: string,
  completed: boolean
};

// Generic "model" object. You can use whatever
// framework you want. For this application it
// may not even be worth separating this logic
// out, but we do this to demonstrate one way to
// separate out parts of your application.
export class TodoModel {

  public key : string;
  public todos : Array<Todo>;
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
    this.todos = this.todos.map<Todo>((todo : Todo) => {
      return Utils.extend({}, todo, {completed: checked});
    });

    this.inform();
  }

  public toggle(todoId: string) {
    this.todos = this.todos.map<Todo>((todo : Todo) => {
      return todo.id !== todoId ?
        todo :
        Utils.extend({}, todo, {completed: !todo.completed});
    });

    this.inform();
  }

  public destroy(todoId: string) {
    this.todos = this.todos.filter(function (candidate) {
      return candidate.id !== todoId;
    });

    this.inform();
  }

  public save(todoId: string, newTitle: string) {
    this.todos = this.todos.map(function (todo) {
      return todo.id !== todoId ? todo : Utils.extend({}, todo, {title: newTitle});
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

// HACK!
(window as any).TodoModel = TodoModel;