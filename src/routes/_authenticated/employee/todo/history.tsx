import { TodoHistory } from '@pages/employee/todo/TodoHistory';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/employee/todo/history')({
  component: TodoHistory
});
