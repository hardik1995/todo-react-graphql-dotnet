import React, { useEffect, useMemo, useState } from 'react';
import {
  Flex,
  View,
  Heading,
  TextField,
  TextArea,
  Button,
  Checkbox,
  ActionButton,
  ProgressCircle,
  Well,
  Content,
  Header,
  Text,
  StatusLight,
  IllustratedMessage,
  Heading as SpectrumHeading,
} from '@adobe/react-spectrum';
import Delete from '@spectrum-icons/workflow/Delete';
import Add from '@spectrum-icons/workflow/Add';
import TaskList from '@spectrum-icons/workflow/TaskList';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import Clock from '@spectrum-icons/workflow/Clock';
import { gql, useMutation, useQuery } from '@apollo/client';

// GraphQL queries, mutations, and subscriptions
const GET_ALL_TASKS = gql`
  query GetAllTasks {
    allTasks {
      id
      title
      description
      status
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String) {
    createTask(input: { title: $title, description: $description }) {
      id
      title
      description
      status
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($id: UUID!, $status: TaskStatus!) {
    updateTaskStatus(input: { id: $id, status: $status }) {
      id
      status
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: UUID!) {
    deleteTask(input: { id: $id })
  }
`;

const TASK_ADDED = gql`
  subscription OnTaskAdded {
    onTaskAdded {
      id
      title
      description
      status
    }
  }
`;

const TASK_UPDATED = gql`
  subscription OnTaskUpdated {
    onTaskUpdated {
      id
      title
      description
      status
    }
  }
`;

const TASK_DELETED = gql`
  subscription OnTaskDeleted {
    onTaskDeleted {
      id
      title
      description
      status
    }
  }
`;

// Type representing a task in TypeScript
type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: 'PENDING' | 'COMPLETED';
};

/**
 * Root component of the app. Provides UI to create tasks and toggle status.
 */
export default function App() {
  const { data, loading, error, subscribeToMore } = useQuery(GET_ALL_TASKS);
  const [createTask, { loading: creating }] = useMutation(CREATE_TASK);
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
  const [deleteTask] = useMutation(DELETE_TASK);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Subscribe to added/updated tasks on mount
  useEffect(() => {
    const unsubAdded = subscribeToMore({
      document: TASK_ADDED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const added: Task = subscriptionData.data.onTaskAdded;
        const exists = prev.allTasks.find((t: Task) => t.id === added.id);
        return exists ? prev : { allTasks: [added, ...prev.allTasks] };
      },
    });
    const unsubUpdated = subscribeToMore({
      document: TASK_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updated: Task = subscriptionData.data.onTaskUpdated;
        return {
          allTasks: prev.allTasks.map((t: Task) =>
            t.id === updated.id ? updated : t,
          ),
        };
      },
    });
    const unsubDeleted = subscribeToMore({
      document: TASK_DELETED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const deleted: Task = subscriptionData.data.onTaskDeleted;
        return {
          allTasks: prev.allTasks.filter((t: Task) => t.id !== deleted.id),
        };
      },
    });
    return () => {
      unsubAdded();
      unsubUpdated();
      unsubDeleted();
    };
  }, [subscribeToMore]);

  const tasks: Task[] = useMemo(() => data?.allTasks ?? [], [data]);

  // Create a new task
  const onAdd = async () => {
    if (!title.trim()) return;
    await createTask({
      variables: { title: title.trim(), description: desc || null },
    });
    setTitle('');
    setDesc('');
  };

  // Toggle a task's status
  const toggle = async (task: Task) => {
    const nextStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    await updateTaskStatus({ variables: { id: task.id, status: nextStatus } });
  };

  // Delete a task
  const handleDelete = async (task: Task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      await deleteTask({ variables: { id: task.id } });
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const totalTasks = tasks.length;

  return (
    <View
      backgroundColor="gray-50"
      minHeight="100vh"
      padding="size-0"
    >
      {/* Beautiful Header */}
      <View
        padding="size-400"
        UNSAFE_className="gradient-header"
        UNSAFE_style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Flex direction="column" alignItems="center" gap="size-200">
          <Flex alignItems="center" gap="size-200">
            <TaskList size="L" UNSAFE_style={{ color: 'white' }} />
            <Heading level={1} margin="size-0">
              <Text UNSAFE_style={{ color: 'white' }}>Realtime TODO</Text>
            </Heading>
          </Flex>
          <Text UNSAFE_style={{ color: 'white', fontSize: '20px', opacity: "0.9" }} >
            Stay organized with real-time task management
          </Text>
        </Flex>
      </View>

      {/* Main Content */}
      <View padding="size-400" maxWidth="1200px" marginX="auto" width="100%">
        {/* Stats Cards */}
        <Flex direction="row" justifyContent="space-between" gap="size-200" marginBottom="size-400" wrap>
          <View
            width="size-4600"
            backgroundColor="static-white"
            borderWidth="thin"
            borderColor="gray-300"
            borderRadius="medium"
            UNSAFE_className="stats-card"
            UNSAFE_style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Flex direction="column" alignItems="center" UNSAFE_className="gradient-header" UNSAFE_style={{ color: 'white', padding: '15px' }} >
              <Clock size="M" />
              <Text UNSAFE_style={{ fontSize: '45px', fontWeight: "bold" }}>
                {pendingTasks}
              </Text>
              <Text UNSAFE_style={{ fontSize: '22px' }}>
                Pending
              </Text>
            </Flex>
          </View>
          <View
            width="size-4600"
            backgroundColor="static-white"
            borderWidth="thin"
            borderColor="gray-300"
            borderRadius="medium"
            UNSAFE_className="stats-card"
            UNSAFE_style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Flex direction="column" alignItems="center" UNSAFE_className="gradient-header" UNSAFE_style={{ color: 'white', padding: '15px' }}>
              <Checkmark size="M" />
              <Text UNSAFE_style={{ fontSize: '45px', fontWeight: "bold" }}>
                {completedTasks}
              </Text>
              <Text UNSAFE_style={{ fontSize: '22px' }}>
                Completed
              </Text>
            </Flex>
          </View>
          <View
            width="size-4600"
            backgroundColor="static-white"
            borderWidth="thin"
            borderColor="gray-300"
            borderRadius="medium"
            UNSAFE_className="stats-card"
            UNSAFE_style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
          >
            <Flex direction="column" alignItems="center" UNSAFE_className="gradient-header" UNSAFE_style={{ color: 'white', padding: '15px' }}>
              <TaskList size="M" />
              <Text UNSAFE_style={{ fontSize: '45px', fontWeight: "bold" }}>
                {totalTasks}
              </Text>
              <Text UNSAFE_style={{ fontSize: '22px' }}>
                Total
              </Text>
            </Flex>
          </View>
        </Flex>

        {/* Add Task Form */}
        <View
          backgroundColor="static-white"
          borderWidth="thin"
          borderColor="gray-300"
          borderRadius="medium"
          marginBottom="size-400"
          UNSAFE_style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
        >
          <Header>
            <Flex alignItems="center" gap="size-150" UNSAFE_style={{ padding: '15px' }}>
              <Add size="S" />
              <Heading level={3} margin="size-0">Add New Task</Heading>
            </Flex>
          </Header>
          <Content>
            <Flex direction="column" gap="size-300" marginTop="size-200" UNSAFE_style={{ padding: '15px' }}>
              <TextField
                label="Task Title"
                placeholder="What needs to be done?"
                value={title}
                onChange={setTitle}
                width="100%"
                isRequired
              />
              <TextArea
                label="Description"
                placeholder="Add more details (optional)"
                value={desc}
                onChange={setDesc}
                width="100%"
              />
              <Flex justifyContent="end">
                <Button
                  variant="cta"
                  isDisabled={!title.trim() || creating}
                  onPress={onAdd}
                  UNSAFE_style={{ minWidth: '120px' }}
                >
                  {creating ? (
                    <Flex alignItems="center" gap="size-100">
                      <ProgressCircle size="S" isIndeterminate />
                      <Text>Adding...</Text>
                    </Flex>
                  ) : (
                    <Flex alignItems="center" gap="size-100">
                      <Add size="S" />
                      <Text>Add Task</Text>
                    </Flex>
                  )}
                </Button>
              </Flex>
            </Flex>
          </Content>
        </View>

        {/* Tasks List */}
        <View
          backgroundColor="static-white"
          borderWidth="thin"
          borderColor="gray-300"
          borderRadius="medium"
          UNSAFE_style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
        >
          <Header>
            <Flex alignItems="center" gap="size-150" UNSAFE_style={{ padding: '15px' }}>
              <TaskList size="S" />
              <Heading level={3} margin="size-0">Your Tasks</Heading>
            </Flex>
          </Header>
          <Content>
            {loading && (
              <Flex justifyContent="center" alignItems="center" UNSAFE_style={{ padding: '30px' }}>
                <Flex direction="column" alignItems="center" gap="size-200">
                  <ProgressCircle size="L" isIndeterminate />
                  <Text>Loading your tasks...</Text>
                </Flex>
              </Flex>
            )}

            {error && (
              <Well margin="size-200">
                <Flex alignItems="center" gap="size-150">
                  <StatusLight variant="negative" />
                  <Text>Error: {error.message}</Text>
                </Flex>
              </Well>
            )}

            {!loading && !error && tasks.length === 0 && (
              <IllustratedMessage>
                <TaskList size="XXL" />
                <SpectrumHeading>No tasks yet</SpectrumHeading>
                <Content>
                  <Text>Create your first task to get started!</Text>
                </Content>
              </IllustratedMessage>
            )}

            {!loading && !error && tasks.length > 0 && (
              <Flex direction="column" gap="size-200" marginTop="size-200" UNSAFE_style={{ padding: '15px' }}>
                {tasks.map((task) => (
                  <View
                    key={task.id}
                    backgroundColor="static-white"
                    borderWidth="thin"
                    borderColor="gray-300"
                    borderRadius="medium"
                    UNSAFE_className={`task-card ${task.status === 'COMPLETED' ? 'completed' : 'pending'}`}
                    UNSAFE_style={{
                      opacity: task.status === 'COMPLETED' ? 0.7 : 1,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <Flex alignItems="center" justifyContent="space-between" UNSAFE_style={{ padding: '15px' }}>
                      <Flex alignItems="center" gap="size-200" flex="1">
                        <Checkbox
                          isSelected={task.status === 'COMPLETED'}
                          onChange={() => toggle(task)}
                          UNSAFE_style={{
                            textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none'
                          }}
                        >
                          <Text
                            UNSAFE_style={{
                              textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                              opacity: task.status === 'COMPLETED' ? 0.6 : 1,
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            {task.title}
                          </Text>
                        </Checkbox>
                        {task.description && (
                          <Text
                            UNSAFE_style={{
                              textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                              opacity: task.status === 'COMPLETED' ? 0.5 : 0.8,
                              fontSize: '14px',
                              color: 'gray'
                            }}
                          >
                            {task.description}
                          </Text>
                        )}
                      </Flex>
                      <Flex alignItems="center" gap="size-150">
                        <StatusLight
                          variant={task.status === 'COMPLETED' ? 'positive' : 'notice'}
                        />
                        <ActionButton
                          onPress={() => handleDelete(task)}
                          UNSAFE_style={{
                            color: 'var(--spectrum-global-color-negative-600)'
                          }}
                          aria-label={`Delete task: ${task.title}`}
                          isQuiet
                        >
                          <Delete />
                        </ActionButton>
                      </Flex>
                    </Flex>
                  </View>
                ))}
              </Flex>
            )}
          </Content>
        </View>
      </View>
    </View>
  );
}