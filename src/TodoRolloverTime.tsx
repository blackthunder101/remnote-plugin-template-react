import React, { useEffect, useState } from 'react';
import { api as remnoteAPI } from 'remnote';


interface TodoRolloverTimeProps {
  todoId: string;
}

const TodoRolloverTime: React.FC<TodoRolloverTimeProps> = ({ todoId }) => {
  const [rolloverTime, setRolloverTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchRolloverTime = async () => {
      const todo = await remnoteAPI.v0.get(todoId);
      const todoRolloverTime = todo.custom.rolloverTime;
      setRolloverTime(todoRolloverTime);
    };

    fetchRolloverTime();
  }, [todoId]);

  return (
    <div className="TodoRolloverTime">
      {rolloverTime ? <p>Rollover Time: {rolloverTime}</p> : <p>No rollover time set.</p>}
    </div>
  );
};

export default TodoRolloverTime;
