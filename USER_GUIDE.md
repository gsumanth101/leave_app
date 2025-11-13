# Leave Management System - User Guide

## 🎨 New UI Features

### Modern Navigation
- **Sidebar Navigation**: Sleek drawer navigation with icons
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Smooth Transitions**: Animated menu selections
- **User Profile**: Shows current user and role in sidebar

### Dashboard Overview
- **Statistics Cards**: Visual representation of key metrics
- **Role-Based Views**: Different dashboards for each role
- **Real-time Updates**: Live data from Firestore

## 👥 User Roles & Permissions

### 1. **Employee**
**Menu Options:**
- 📊 Dashboard - View statistics
- ➕ Apply Leave - Submit leave/permission requests
- 📋 My Leaves - View leave history and status

**Features:**
- Apply for various leave types (Casual, Sick, Earned, etc.)
- Track approval status in real-time
- View complete leave history

### 2. **HR (Human Resources)**
**Menu Options:**
- 📊 Dashboard - Team overview and statistics
- ✅ Approve Leaves - Review and approve/reject team leave requests
- 📋 Team Leaves - View all leaves from assigned employees

**Features:**
- See only leaves from employees assigned to them
- Approve or reject leave requests
- Add remarks to decisions
- View team statistics

### 3. **GM (General Manager)**
**Menu Options:**
- 📊 Dashboard - Department overview and statistics
- ✅ Approve Leaves - Review and approve/reject team leave requests
- 📋 Team Leaves - View all leaves from assigned employees

**Features:**
- Same as HR role
- Manage assigned team members
- Department-level oversight

### 4. **AE (Account Executive)**
**Menu Options:**
- 📊 Dashboard - Organization-wide statistics
- 👥 Manage Employees - Add/Edit/Delete employees, HR, and GM
- ✅ Final Approval - Provide final approval after HR/GM
- 📋 All Leaves - View all leave requests

**Features:**
- **Full Employee Management**:
  - Add new employees with all roles
  - Update employee information
  - Assign employees to HR/GM/AE
  - Delete employees
- **Complete Oversight**: View all leaves across organization
- **Final Authority**: Final approval power after HR/GM
- **Organization Statistics**: Total employees, pending leaves, etc.

## 🔄 Leave Approval Workflow

### Step 1: Employee Submits Leave
- Employee fills out leave application form
- Request automatically routes to assigned HR/GM/AE
- Status: **Pending**

### Step 2: HR/GM Reviews
- Assigned HR or GM reviews the leave request
- Can approve or reject with remarks
- If approved → Routes to AE for final approval
- If rejected → Status: **Rejected** (workflow ends)

### Step 3: AE Final Approval
- AE reviews leaves approved by HR/GM
- Can give final approval or reject
- If approved → Status: **Approved** ✅
- If rejected → Status: **Rejected** ❌

## 📊 Dashboard Statistics

### For Employees:
- Pending Leaves
- Approved Leaves
- Rejected Leaves

### For HR/GM:
- Total Employees (organization-wide)
- My Team Size
- Pending Leaves (from team)
- Approved Leaves (from team)
- Rejected Leaves (from team)

### For AE:
- Total Employees
- My Team Size
- Pending Leaves (all)
- Approved Leaves (all)
- Rejected Leaves (all)

## 🛠️ Employee Management (AE Only)

### Add New Employee
1. Click "Add Employee" button
2. Fill in details:
   - Full Name
   - Email
   - Password
   - Role (Employee, HR, GM, AE)
   - Department
   - Assign to Manager
3. Click "Add"

### Edit Employee
1. Click edit icon (✏️) next to employee
2. Update information
3. Reassign to different manager if needed
4. Click "Update"

### Delete Employee
1. Click delete icon (🗑️) next to employee
2. Confirm deletion
3. Employee record is removed

### Assign Employees to Managers
- Each employee can be assigned to an HR, GM, or AE
- Leave requests automatically route to assigned manager
- Managers see only their team's leave requests

## 🎨 UI Components

### Color Scheme
- **Primary**: Purple gradient (#667eea → #764ba2)
- **Success**: Green for approved items
- **Warning**: Orange for pending items
- **Error**: Red for rejected items

### Icons Guide
- 📊 Dashboard
- ➕ Add/Apply
- 📋 History/List
- ✅ Approve
- 👥 People/Employees
- 📈 Statistics
- 🚪 Logout

## 🔒 Security Features

### Firestore Rules
- Employees can only read/write their own leave requests
- HR/GM can only see leaves from assigned employees
- AE can view all data
- Role-based access control enforced at database level

### Authentication
- Secure Firebase Authentication
- Email/Password login
- Session management
- Protected routes

## 📱 Responsive Design

### Mobile View
- Collapsible sidebar menu
- Touch-friendly buttons
- Optimized tables for small screens
- Hamburger menu for navigation

### Desktop View
- Persistent sidebar navigation
- Full-width tables
- Multi-column layouts
- Enhanced statistics cards

## 🚀 Getting Started

### First-Time Setup
1. Create an AE account first (use signup page)
2. AE logs in and creates HR/GM accounts
3. AE or HR/GM creates employee accounts
4. AE assigns employees to their managers
5. Employees can now apply for leaves

### Daily Workflow
1. **Employees**: Apply for leaves as needed
2. **HR/GM**: Review and approve team leaves daily
3. **AE**: Provide final approval for all leaves
4. Everyone can view their dashboard statistics

## 📞 Support

For technical issues or questions:
- Check Firestore security rules are properly set
- Ensure all users are assigned to managers
- Verify leave requests have proper routing

## 🔄 Updates & Enhancements

### Recent Changes
- ✅ Modern sidebar navigation with icons
- ✅ Employee management system
- ✅ Hierarchical leave routing
- ✅ Statistics dashboard
- ✅ Manager assignment system
- ✅ Filtered views for HR/GM
- ✅ Mobile responsive design
- ✅ Real-time data updates
