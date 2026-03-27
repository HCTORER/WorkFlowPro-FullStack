import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { api } from "../api/api";
import AppNavbar from "../components/AppNavbar";
import type { Project } from "../types/project";
import type { TaskItem } from "../types/task";
import type { User } from "../types/user";
import { isAdminOrOwner } from "../utils/permissions";

const columns = ["Backlog", "ToDo", "InProgress", "Review", "Done"] as const;

type ColumnKey = (typeof columns)[number];

export default function DashboardPage() {
  const fullName = localStorage.getItem("fullName");
  const currentUserId = Number(localStorage.getItem("userId"));
  const canManage = isAdminOrOwner();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<number | "">("");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get<Project[]>("/Projects");
      setProjects(res.data);

      if (res.data.length > 0 && selectedProjectId === "") {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  }, [selectedProjectId]);

  const fetchTasks = useCallback(async (projectId: number) => {
    setLoadingTasks(true);

    try {
      const res = await api.get<TaskItem[]>(`/Tasks/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!canManage) return;

    try {
      const res = await api.get<User[]>("/Users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, [canManage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedProjectId !== "") {
      fetchTasks(selectedProjectId);
    }
  }, [selectedProjectId, fetchTasks]);

  const createProject = async () => {
    if (!canManage) return;
    if (!newProjectName.trim()) return;

    try {
      await api.post("/Projects", {
        name: newProjectName,
        description: newProjectDescription,
      });

      setNewProjectName("");
      setNewProjectDescription("");
      await fetchProjects();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const createTask = async () => {
    if (!canManage) return;
    if (!newTaskTitle.trim() || selectedProjectId === "") return;

    try {
      await api.post("/Tasks", {
        projectId: selectedProjectId,
        title: newTaskTitle,
        description: newTaskDescription,
        assignedUserId: assignedUserId || null,
        dueDate: null,
      });

      setNewTaskTitle("");
      setNewTaskDescription("");
      setAssignedUserId("");

      await fetchTasks(selectedProjectId);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    const statusMap: Record<string, number> = {
      Backlog: 0,
      ToDo: 1,
      InProgress: 2,
      Review: 3,
      Done: 4,
    };

    try {
      await api.patch(`/Tasks/${taskId}/status`, {
        status: statusMap[status],
      });

      if (selectedProjectId !== "") {
        await fetchTasks(selectedProjectId);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const assignTaskUser = async (taskId: number, userId: number) => {
    if (!canManage) return;

    try {
      await api.patch(`/Tasks/${taskId}/assign`, {
        assignedUserId: userId,
      });

      if (selectedProjectId !== "") {
        await fetchTasks(selectedProjectId);
      }
    } catch (err) {
      console.error("Failed to assign task:", err);
    }
  };

  const canMoveTask = (task: TaskItem) => {
    if (canManage) return true;
    return task.assignedUserId === currentUserId;
  };

  const groupedTasks = useMemo<Record<ColumnKey, TaskItem[]>>(() => {
    return {
      Backlog: tasks.filter((t) => t.status === "Backlog"),
      ToDo: tasks.filter((t) => t.status === "ToDo"),
      InProgress: tasks.filter((t) => t.status === "InProgress"),
      Review: tasks.filter((t) => t.status === "Review"),
      Done: tasks.filter((t) => t.status === "Done"),
    };
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = groupedTasks.Done.length;
  const activeProjects = projects.length;
  const assignedTasks = tasks.filter((t) => t.assignedUserId != null).length;

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const taskId = Number(result.draggableId);
    const newStatus = result.destination.droppableId as ColumnKey;

    const draggedTask = tasks.find((t) => t.id === taskId);
    if (!draggedTask) return;

    if (draggedTask.status === newStatus) return;

    if (!canMoveTask(draggedTask)) return;

    await updateTaskStatus(taskId, newStatus);
  };

  return (
    <div className="wf-page">
      <AppNavbar />

      <div className="container py-4">
        <div className="wf-hero mb-4">
          <div>
            <p className="wf-kicker mb-2">Workspace overview</p>
            <h1 className="wf-title mb-2">Welcome back, {fullName}</h1>
            <p className="wf-subtitle mb-0">
              Manage your projects, tasks, and team workflow from a single
              place.
            </p>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-xl-3">
            <div className="wf-stat-card">
              <div className="wf-stat-label">Projects</div>
              <div className="wf-stat-value">{activeProjects}</div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="wf-stat-card">
              <div className="wf-stat-label">Total Tasks</div>
              <div className="wf-stat-value">{totalTasks}</div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="wf-stat-card">
              <div className="wf-stat-label">Completed</div>
              <div className="wf-stat-value">{completedTasks}</div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-3">
            <div className="wf-stat-card">
              <div className="wf-stat-label">Assigned</div>
              <div className="wf-stat-value">{assignedTasks}</div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {canManage && (
            <div className="col-12 col-xl-6">
              <div className="wf-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h4 mb-0">Create Project</h2>
                  <span className="wf-chip">Admin area</span>
                </div>

                <div className="mb-3">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe the project"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                  />
                </div>

                <button className="btn btn-dark px-4" onClick={createProject}>
                  Create Project
                </button>
              </div>
            </div>
          )}

          <div className={canManage ? "col-12 col-xl-6" : "col-12"}>
            <div className="wf-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h4 mb-0">Active Project</h2>
                <span className="wf-chip wf-chip-light">Workspace</span>
              </div>

              {loadingProjects ? (
                <p className="text-muted mb-0">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="text-muted mb-0">No projects yet.</p>
              ) : (
                <select
                  className="form-select"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {canManage && (
          <div className="wf-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">Create Task</h2>
              <span className="wf-chip">Management</span>
            </div>

            <div className="row g-3">
              <div className="col-12 col-lg-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div className="col-12 col-lg-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Task description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>

              <div className="col-12 col-lg-2">
                <select
                  className="form-select"
                  value={assignedUserId}
                  onChange={(e) =>
                    setAssignedUserId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                >
                  <option value="">Assign user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-lg-2 d-grid">
                <button className="btn btn-dark" onClick={createTask}>
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="wf-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h4 mb-1">Kanban Board</h2>
              <p className="text-muted mb-0 small">
                Track work across each project stage.
              </p>
            </div>
          </div>

          {loadingTasks ? (
            <p className="text-muted mb-0">Loading tasks...</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="wf-board-grid">
                {columns.map((column) => (
                  <Droppable droppableId={column} key={column}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="wf-kanban-column p-3"
                      >
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h3 className="h6 fw-bold mb-0">{column}</h3>
                          <span className="wf-column-count">
                            {groupedTasks[column].length}
                          </span>
                        </div>

                        {groupedTasks[column].length === 0 && (
                          <div className="wf-empty-state">No tasks</div>
                        )}

                        {groupedTasks[column].map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                            isDragDisabled={!canMoveTask(task)}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="wf-task-card p-3 mb-3"
                              >
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h4 className="h6 mb-0">{task.title}</h4>
                                  <span className="wf-priority-badge">
                                    {task.priority}
                                  </span>
                                </div>

                                <p className="small text-muted mb-3">
                                  {task.description || "No description"}
                                </p>

                                <div className="small text-muted mb-1">
                                  Assigned:{" "}
                                  {task.assignedUserFullName ?? "Unassigned"}
                                </div>

                                {canManage && (
                                  <div className="mb-3 mt-2">
                                    <select
                                      className="form-select form-select-sm"
                                      value={task.assignedUserId ?? ""}
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          assignTaskUser(
                                            task.id,
                                            Number(e.target.value),
                                          );
                                        }
                                      }}
                                    >
                                      <option value="">Assign user</option>
                                      {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                          {user.fullName}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                <div className="d-flex gap-2 mt-3">
                                  {column !== "Backlog" &&
                                    canMoveTask(task) && (
                                      <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() =>
                                          updateTaskStatus(
                                            task.id,
                                            columns[
                                              columns.indexOf(column) - 1
                                            ],
                                          )
                                        }
                                      >
                                        ←
                                      </button>
                                    )}

                                  {column !== "Done" && canMoveTask(task) && (
                                    <button
                                      className="btn btn-outline-secondary btn-sm"
                                      onClick={() =>
                                        updateTaskStatus(
                                          task.id,
                                          columns[columns.indexOf(column) + 1],
                                        )
                                      }
                                    >
                                      →
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
}
