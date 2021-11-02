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
  totalTimeSpent: number;
};

type PomodoroSettings = {
  workTime: number;
  restTime: number;
};

type PomodoroTimer = {
  mode: 'WORK' | 'REST';
  timeLeft: number;
};

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  timeSpent: number;
  active: boolean;
  pomodoroTimer: PomodoroTimer;
};

class Pomodoro {
  private pomodoroSettings: PomodoroSettings;

  constructor(settings: PomodoroSettings) {
    this.pomodoroSettings = settings;
  }

  public updateSettings(settings: PomodoroSettings) {
    this.pomodoroSettings = settings;
  }

  public tick(pomodoro: PomodoroTimer): PomodoroTimer {
    let newTimeLeft = pomodoro.timeLeft - 1;
    if (pomodoro.timeLeft > 0) {
      return {mode: pomodoro.mode, timeLeft: newTimeLeft};
    }
    
    let newMode = pomodoro.mode;
    if (pomodoro.mode === 'REST') {
      newMode = 'WORK';
      newTimeLeft = this.pomodoroSettings.workTime;
    } else {
      newMode = 'REST';
      newTimeLeft = this.pomodoroSettings.restTime;      
    }
    return {mode: newMode, timeLeft: newTimeLeft};
  }

  public newTimer(): PomodoroTimer {
    return {mode: 'WORK', timeLeft: this.pomodoroSettings.workTime};
  }
}

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
  private totalTimeSpent: number;
  private pomodoroSettings: PomodoroSettings;
  private pomodoro: Pomodoro;

  constructor(key: string) {
    this.key = key;
    this.todos = Utils.store(key);
    this.totalTimeSpent = 0;
    this.onChanges = [];
    this.selectedTab = 'ALL';
    this.pomodoroSettings = {workTime: 25, restTime: 5};
    this.pomodoro = new Pomodoro({workTime: 25, restTime: 5});
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
      completed: false,
      timeSpent: 0,
      active: false,
      pomodoroTimer: this.pomodoro.newTimer(),
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

  public markActive(todoId: string) {
    this.todos = this.todos.map<Todo>((todo : Todo) => {
      const newActiveState = todo.id === todoId;
      return Utils.extend({}, todo, {active: newActiveState});
    });

    this.inform();
  }

  public markInactive(todoId: string) {
    this.todos = this.todos.map<Todo>((todo : Todo) => {
      return todo.id !== todoId ?
        todo :
        Utils.extend({}, todo, {active: false});
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
      showFooter: (activeCount > 0) || (completedCount > 0),
      totalTimeSpent: this.totalTimeSpent,
    };
  }
  
  public tick() {
    this.todos = this.todos.map((todo) => {
      return todo.active ? 
        ({
          ...todo,
          timeSpent: todo.timeSpent+1,
          pomodoroTimer: this.pomodoro.tick(todo.pomodoroTimer)
        }) :
        todo;
    });
    const anyTodoActive = this.todos.some((t) => t.active);
    if (anyTodoActive) {
      this.totalTimeSpent++;
    }
    this.inform();
  }

  public updatePomodoroSettings(settings: PomodoroSettings) {
    this.pomodoro.updateSettings(settings);
  }
}

// HACK!
(window as any).TodoModel = TodoModel;