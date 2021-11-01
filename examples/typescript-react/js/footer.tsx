/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React */

import * as classNames from "classnames";
import * as React from "react";
import { ALL_TODOS, ACTIVE_TODOS, COMPLETED_TODOS } from "./constants";
import { TodoModel } from "./todoModel";
import { Utils } from "./utils";

interface Props {
  completedCount : number;
  count : number;
  activeTab: 'ALL' | 'ACTIVE' | 'COMPLETED';
  model: TodoModel;
}

class TodoFooter extends React.Component<Props, {}> {

  public render() {
    var activeTodoWord = Utils.pluralize(this.props.count, 'item');
    var clearButton = null;

    if (this.props.completedCount > 0) {
      clearButton = (
        <button
          className="clear-completed"
          onClick={() => {this.props.model.clearCompleted();}}>
          Clear completed
        </button>
      );
    }

    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{this.props.count}</strong> {activeTodoWord} left
        </span>
        <ul className="filters">
          <li>
            <a
              href="#/"
              className={classNames({selected: this.props.activeTab === 'ALL'})}>
                All
            </a>
          </li>
          {' '}
          <li>
            <a
              href="#/active"
              className={classNames({selected: this.props.activeTab === 'ACTIVE'})}>
                Active
            </a>
          </li>
          {' '}
          <li>
            <a
              href="#/completed"
              className={classNames({selected: this.props.activeTab === 'COMPLETED'})}>
                Completed
            </a>
          </li>
        </ul>
        {clearButton}
      </footer>
    );
  }
}

export { TodoFooter };
