# Firestore Database Structure

## Collections

### 1. users
Stores user information and roles
```
users/{userId}
  - email: string
  - role: string (employee, HR, GM, AE)
  - fullName: string
  - createdAt: timestamp
```

### 2. leaveRequests
Stores all leave and permission requests
```
leaveRequests/{requestId}
  - userId: string (reference to user)
  - userEmail: string
  - userName: string (optional)
  - type: string (leave, permission)
  - leaveType: string (casual, sick, earned, maternity, paternity, unpaid)
  - startDate: string (DD/MM/YYYY)
  - endDate: string (DD/MM/YYYY)
  - duration: number (days)
  - reason: string
  - description: string (optional)
  - status: string (pending, hr_approved, approved, rejected)
  
  Level 1 - HR Approval:
  - hrApproval: object {
      status: string (approved, rejected),
      approvedBy: string (email),
      approvedByName: string,
      remarks: string (optional),
      timestamp: timestamp
    }
  
  Level 2 - GM/AE Approval:
  - gmaeApproval: object {
      status: string (approved, rejected),
      approvedBy: string (email),
      approvedByRole: string (GM, AE),
      remarks: string (optional),
      timestamp: timestamp
    }
  
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Firestore Security Rules

Add these rules to your Firebase Console (Firestore Database → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if isSignedIn() && request.auth.uid == userId;
      
      // Only allow creation during signup
      allow create: if isSignedIn();
      
      // HR, GM, and AE can read all users
      allow read: if isSignedIn() && getUserRole() in ['HR', 'GM', 'AE'];
    }
    
    // Leave Requests collection
    match /leaveRequests/{requestId} {
      // Employees can create leave requests
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      
      // Users can read their own requests
      allow read: if isSignedIn() && 
        (resource.data.userId == request.auth.uid || 
         getUserRole() in ['HR', 'GM', 'AE']);
      
      // HR, GM, and AE can update leave requests
      allow update: if isSignedIn() && getUserRole() in ['HR', 'GM', 'AE'];
      
      // Only HR and GM can delete (optional)
      allow delete: if isSignedIn() && getUserRole() in ['HR', 'GM'];
    }
  }
}
```

## Firestore Indexes

### Required Composite Indexes

Create these composite indexes in Firebase Console (Firestore Database → Indexes):

1. **leaveRequests Collection**
   - **Index 1**: userId (Ascending) + createdAt (Descending)
   - **Index 2**: assignedTo (Ascending) + createdAt (Descending)

**Note**: To avoid needing complex composite indexes, the application now uses client-side filtering for status-based queries. Only the indexes above are required.

### Quick Fix - Click the Error Link

**FASTEST METHOD**: When you see the error message, click the link provided in the error. It will automatically create the required index for you!

**Your Error Link**: 
```
https://console.firebase.google.com/v1/r/project/dotted-carrier-461908-s2/firestore/indexes?create_composite=Cl5wcm9qZWN0cy9kb3R0ZWQtY2Fycmllci00NjE5MDgtczIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xlYXZlUmVxdWVzdHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

1. Click the link in your browser
2. Sign in to Firebase Console
3. Click "Create Index"
4. Wait 2-5 minutes for index to build
5. Refresh your app

### Manual Index Creation

If you prefer to create indexes manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dotted-carrier-461908-s2`
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. For each index above:
   - Collection ID: `leaveRequests`
   - Add fields as specified
   - Set sort order (Ascending/Descending)
   - Click **Create**

## Setup Instructions

1. **Enable Firestore Database**
   - Go to Firebase Console → Firestore Database
   - Click "Create database"
   - Start in test mode (for development)
   - Choose your region

2. **Apply Security Rules**
   - Go to Firestore Database → Rules
   - Copy and paste the rules above
   - Click "Publish"

3. **Create Indexes**
   - Indexes will be created automatically when you run queries
   - Or manually create them in Firestore Database → Indexes

4. **Test the Application**
   - Create a user with each role (employee, HR, GM, AE)
   - Test the approval workflow

## Two-Level Approval Workflow

### Level 1: HR Approval (First Level)
1. **Employee** creates a leave request
   - Status: `pending`
   - hrApproval: not set (will be created on approval)

2. **HR** reviews ALL leave requests (first level)
   - If approved: 
     - hrApproval: { status: 'approved', approvedBy: email, remarks, timestamp }
     - Status changes to: `hr_approved`
   - If rejected:
     - hrApproval: { status: 'rejected', approvedBy: email, remarks, timestamp }
     - Status changes to: `rejected` (workflow ends)

### Level 2: GM/AE Approval (Second Level)
3. **GM or AE** reviews leaves with status = `hr_approved`
   - If approved:
     - gmaeApproval: { status: 'approved', approvedBy: email, approvedByRole, remarks, timestamp }
     - Status changes to: `approved` (fully approved)
   - If rejected:
     - gmaeApproval: { status: 'rejected', approvedBy: email, approvedByRole, remarks, timestamp }
     - Status changes to: `rejected`

4. **Employee** can view the status at any time
   - Pending: Awaiting HR approval
   - HR Approved - Awaiting GM/AE: Passed first level
   - Fully Approved: Both levels approved
   - Rejected: Rejected at any level
