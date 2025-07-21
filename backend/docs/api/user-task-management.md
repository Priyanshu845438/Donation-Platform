
# User Task Management API

This API allows all users (admin, NGO, company, donor) to manage their personal tasks and calendar reminders.

## Base URL
```
http://0.0.0.0:5000/api/user/tasks
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Task Object Structure

```json
{
  "_id": "ObjectId",
  "title": "string (required)",
  "description": "string",
  "dueDate": "Date (required)",
  "dueTime": "string (HH:MM format, default: 09:00)",
  "priority": "string (low, medium, high, urgent, default: medium)",
  "status": "string (pending, in-progress, completed, cancelled, default: pending)",
  "category": "string (meeting, review, approval, maintenance, deadline, other, default: other)",
  "reminderBefore": "number (minutes before due time, default: 30)",
  "isRecurring": "boolean (default: false)",
  "recurringType": "string (daily, weekly, monthly, yearly - required if isRecurring)",
  "recurringEndDate": "Date (required if isRecurring)",
  "notes": "string",
  "createdBy": "ObjectId (auto-set)",
  "reminderSent": "boolean (default: false)",
  "completedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Endpoints

### 1. Get User Tasks
**GET** `/api/user/tasks`

Get user's tasks with filtering, search, and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Tasks per page (default: 10)
- `status` (string): Filter by status (pending, in-progress, completed, cancelled)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `category` (string): Filter by category (meeting, review, approval, maintenance, deadline, other)
- `search` (string): Search in title, description, notes
- `startDate` (YYYY-MM-DD): Filter from date
- `endDate` (YYYY-MM-DD): Filter to date

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "tasks": [
    {
      "_id": "task_id",
      "title": "Team Meeting",
      "description": "Weekly team sync",
      "dueDate": "2024-01-25T00:00:00.000Z",
      "dueTime": "14:00",
      "priority": "high",
      "status": "pending",
      "category": "meeting",
      "isOverdue": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalTasks": 25,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "total": 25,
    "pending": 10,
    "in-progress": 5,
    "completed": 8,
    "cancelled": 2,
    "overdue": 3
  }
}
```

### 2. Create Task
**POST** `/api/user/tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Monthly team sync meeting",
  "dueDate": "2024-01-25",
  "dueTime": "14:00",
  "priority": "high",
  "category": "meeting",
  "reminderBefore": 30,
  "isRecurring": true,
  "recurringType": "monthly",
  "recurringEndDate": "2024-12-31",
  "notes": "Prepare monthly report"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "task_id",
    "title": "Team Meeting",
    "dueDate": "2024-01-25T00:00:00.000Z",
    "status": "pending",
    "createdBy": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 3. Get Single Task
**GET** `/api/user/tasks/:id`

Get details of a specific task.

**Response:**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "task": {
    "_id": "task_id",
    "title": "Team Meeting",
    "description": "Monthly team sync meeting",
    "dueDate": "2024-01-25T00:00:00.000Z",
    "dueTime": "14:00",
    "priority": "high",
    "status": "pending",
    "category": "meeting",
    "isOverdue": false,
    "createdBy": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 4. Update Task
**PUT** `/api/user/tasks/:id`

Update task details.

**Request Body:**
```json
{
  "title": "Updated Team Meeting",
  "priority": "urgent",
  "status": "in-progress",
  "notes": "Added new agenda items"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {
    "_id": "task_id",
    "title": "Updated Team Meeting",
    "priority": "urgent",
    "status": "in-progress"
  }
}
```

### 5. Delete Task
**DELETE** `/api/user/tasks/:id`

Delete a task permanently.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### 6. Mark Task Completed
**PATCH** `/api/user/tasks/:id/complete`

Mark a task as completed.

**Response:**
```json
{
  "success": true,
  "message": "Task marked as completed",
  "task": {
    "_id": "task_id",
    "status": "completed",
    "completedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

## Calendar Views

### 7. Get Calendar View
**GET** `/api/user/tasks/calendar/view`

Get monthly calendar view with tasks grouped by date.

**Query Parameters:**
- `year` (number): Year (default: current year)
- `month` (number): Month 1-12 (default: current month)

**Response:**
```json
{
  "success": true,
  "message": "Calendar view retrieved successfully",
  "calendar": {
    "year": 2024,
    "month": 1,
    "monthName": "January",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "tasksByDate": {
      "2024-01-15": [
        {
          "_id": "task_id_1",
          "title": "Team Meeting",
          "dueTime": "14:00",
          "priority": "high"
        }
      ],
      "2024-01-20": [
        {
          "_id": "task_id_2",
          "title": "Project Review",
          "dueTime": "10:00",
          "priority": "medium"
        }
      ]
    },
    "totalTasks": 15
  }
}
```

### 8. Get Today's Tasks
**GET** `/api/user/tasks/today/list`

Get today's tasks and overdue tasks.

**Response:**
```json
{
  "success": true,
  "message": "Today's tasks retrieved successfully",
  "todaysTasks": [
    {
      "_id": "task_id",
      "title": "Team Meeting",
      "dueTime": "14:00",
      "priority": "high",
      "status": "pending"
    }
  ],
  "overdueTasks": [
    {
      "_id": "overdue_task_id",
      "title": "Overdue Task",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "priority": "urgent"
    }
  ],
  "summary": {
    "totalToday": 3,
    "completedToday": 1,
    "pendingToday": 2,
    "overdueCount": 1
  }
}
```

### 9. Get Upcoming Tasks
**GET** `/api/user/tasks/upcoming/list`

Get upcoming tasks for the next 7 days.

**Response:**
```json
{
  "success": true,
  "message": "Upcoming tasks retrieved successfully",
  "upcomingTasks": [
    {
      "_id": "task_id",
      "title": "Project Deadline",
      "dueDate": "2024-01-22T00:00:00.000Z",
      "dueTime": "17:00",
      "priority": "urgent",
      "category": "deadline"
    }
  ],
  "count": 5
}
```

## Task Categories

- **meeting**: Team meetings, client calls, conferences
- **review**: Document reviews, code reviews, approvals
- **approval**: Items requiring approval or sign-off
- **maintenance**: System maintenance, updates, repairs
- **deadline**: Project deadlines, submission dates
- **other**: General tasks not fitting other categories

## Priority Levels

- **low**: Non-urgent tasks with flexible deadlines
- **medium**: Standard priority tasks (default)
- **high**: Important tasks requiring attention
- **urgent**: Critical tasks requiring immediate action

## Status Types

- **pending**: Task not yet started (default)
- **in-progress**: Task currently being worked on
- **completed**: Task finished successfully
- **cancelled**: Task cancelled or no longer needed

## Recurring Tasks

For recurring tasks, set:
- `isRecurring`: true
- `recurringType`: daily, weekly, monthly, or yearly
- `recurringEndDate`: When the recurring pattern should end

## Error Responses

All endpoints return error responses in this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common error codes:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid token)
- **404**: Not Found (task not found)
- **500**: Internal Server Error

## Usage Examples

### Create a Simple Task
```bash
curl -X POST "http://0.0.0.0:5000/api/user/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review Campaign Proposal",
    "description": "Review the new education campaign proposal",
    "dueDate": "2024-01-20",
    "dueTime": "10:00",
    "priority": "high",
    "category": "review"
  }'
```

### Get Tasks for Current Month
```bash
curl -X GET "http://0.0.0.0:5000/api/user/tasks/calendar/view?year=2024&month=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Tasks
```bash
curl -X GET "http://0.0.0.0:5000/api/user/tasks?search=meeting&status=pending&priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
