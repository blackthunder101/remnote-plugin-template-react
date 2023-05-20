import React, { useEffect, useState } from 'react';
import { api as remnoteAPI } from 'remnote';
import TodoRolloverTime from './TodoRolloverTime';

// a helper function to check if a rem is an unfinished todo
const isUnfinishedTodo = (rem: any) => {
  return rem.type === 'TODO' && !rem.checked;
};

// a function to move all the unfinished todos from today to the next day
const moveUnfinishedTodos = async () => {
  try {
    // get the current date and format it as YYYY-MM-DD
    const today = new Date();
    const todayString = today.toISOString().slice(0, 10);

    // get the rem for today's date or create one if it doesn't exist
    let todayRem = await api.get(todayString);
    if (!todayRem) {
      todayRem = await api.create(todayString);
    }

    // filter out the unfinished todos from today's rem children
    const unfinishedTodos = todayRem.children.filter(isUnfinishedTodo);

    // if there are any unfinished todos, move them to the next day's rem
    if (unfinishedTodos.length > 0) {
      // get the next day's date and format it as YYYY-MM-DD
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      const nextDayString = nextDay.toISOString().slice(0, 10);

      // get the rem for the next day's date or create one if it doesn't exist
      let nextDayRem = await api.get(nextDayString);
      if (!nextDayRem) {
        nextDayRem = await api.create(nextDayString);
      }

      // loop through the unfinished todos and move them to the next day's rem
      for (const unfinishedTodo of unfinishedTodos) {
        await api.move(unfinishedTodo.id, nextDayRem.id);
      }

      // update today's rem with the remaining children that are not unfinished todos
      await api.update(
        todayRem.id,
        { children: todayRem.children.filter((rem: any) => !isUnfinishedTodo(rem)) }
      );
    }
  } catch (error) {
    // log and alert any errors that may occur while moving the unfinished todos
    console.error(error);
    alert('Something went wrong while moving unfinished todos.');
  }
};

// a function to trigger the rollover process manually
const triggerRollover = async () => {
  await moveUnfinishedTodos();
};
 
const App: React.FC = () => {
  // create a state variable to store the selected todo's ID
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  // fetch all the todos from a document and store them in a state variable
  const [todos, setTodos] = useState<any[]>([]);

  useEffect(() => {
    // define a function to fetch all the todos using the RemNote API
    const fetchTodos = async () => {
      try {
        // log a message before fetching the todos
        console.log('fetching todos');
        const allTodos = await remnoteAPI.v0.search('type:todo');
        // log the fetched todos after setting the state variable
        setTodos(allTodos);
        console.log(todos);
      } catch (error) {
        // log and alert any errors that may occur while fetching the todos
        console.error(error);
        alert('Something went wrong while fetching the todos.');
      }
    };

    // call the fetchTodos function when the component mounts
    fetchTodos();

    // call the moveUnfinishedTodos function when the component mounts
    moveUnfinishedTodos();

    // add a custom omnibar command to trigger the rollover process manually
    remnoteAPI.omnibar.addCommand({
      name: 'Manually Trigger Rollover',
      description: 'Trigger the rollover process for moving unfinished todos.',
      action: triggerRollover,
    });

    // register a callback function to handle any errors that may occur in the RemNote API
    remnoteAPI.errorHandler.addCallback((error) => {
      console.error(error);
      alert('Something went wrong in the RemNote API.');
    });
  }, []);
 
  return (
    <div className="App">
      <h1>Move Unfinished Todos</h1>
      <p>This plugin moves unfinished todos to the next day.</p>
      <label htmlFor="rollover-time">Rollover Time:</label>
      <input
        type="time"
        id="rollover-time"
        name="rollover-time"
        defaultValue="23:00"
        onChange={async (event) => {
          const rolloverTime = event.target.value;
          // validate the input value using a regex pattern for HH:mm format
          if (rolloverTime && rolloverTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
            try {
              // set the rolloverTime setting using the RemNote API
              await remnoteAPI.settings.set('rolloverTime', rolloverTime);
              // show a success message to the user
              alert('Rollover time set successfully.');
            } catch (error) {
              // log and alert any errors that may occur while setting the rollover time
              console.error(error);
              alert('Something went wrong while setting the rollover time.');
            }
          } else {
            // show a warning message to the user if the input is invalid
            alert('Please enter a valid time in HH:mm format.');
          }
        }}
      />
      {/* display the list of todos in a dropdown menu and update the selected todo's ID */}
      <select
        value={selectedTodoId || ''}
        onChange={(event) => {
          setSelectedTodoId(event.target.value);
        }}
      >
        <option value="">Select a todo</option>
        {todos.map((todo) => (
          <option key={todo.id} value={todo.id}>
            {todo.name}
          </option>
        ))}
      </select>
      {/* pass the selected todo's ID as a prop to the TodoRolloverTime component */}
      {selectedTodoId && <TodoRolloverTime todoId={selectedTodoId} />}
    </div>
  );
};
 
export default App;
