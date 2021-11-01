describe("TodoModel", function() {
  beforeEach(function() {
    localStorage.clear();
    todoModel = new TodoModel();
  });

  it("adds a todo", function() {
    todoModel.addTodo('task #1');

    const view = todoModel.getView();
    expect(view.todos.length).toEqual(1);
    expect(view.todos[0]).toEqual(
      jasmine.objectContaining({title: 'task #1'}))
  });

});
