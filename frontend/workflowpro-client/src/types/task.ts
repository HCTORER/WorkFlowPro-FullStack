export type TaskItem = {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedUserId: number | null;
  assignedUserFullName: string | null;
  dueDate: string | null;
  createdAt: string;
};
