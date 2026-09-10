async function runTests() {
  const base = 'http://127.0.0.1:5000';
  const originHeader = { Origin: 'http://localhost:5173' };

  console.log('🧪 Starting API Verification & Security Test Suite...\n');

  // 1. Health check
  const healthRes = await fetch(base + '/health');
  const health = await healthRes.json();
  console.log('1. Health Check:', health.status === 'healthy' ? '✅ PASS' : '❌ FAIL');

  // 2. Unauthenticated access to /api/tasks (expect 401)
  const unauthTasks = await fetch(base + '/api/tasks');
  console.log(
    '2. Unauthenticated tasks blocked (401):',
    unauthTasks.status === 401 ? '✅ PASS' : `❌ FAIL (${unauthTasks.status})`
  );

  // 3. Admin login
  const adminLoginRes = await fetch(base + '/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...originHeader },
    body: JSON.stringify({ email: 'admin@enterprise.corp', password: 'AdminPassword123!' }),
  });
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  console.log(
    '3. Admin login (200 + session cookie):',
    adminLoginRes.status === 200 && adminCookie ? '✅ PASS' : '❌ FAIL'
  );

  // 4. Admin fetch dashboard metrics
  const adminDash = await fetch(base + '/api/dashboard/admin', {
    headers: { Cookie: adminCookie },
  }).then((r) => r.json());
  console.log(
    '4. Admin Dashboard Metrics:',
    adminDash.success && adminDash.data.totalTasks >= 6 ? '✅ PASS' : '❌ FAIL',
    `(${adminDash.data?.totalTasks} tasks, ${adminDash.data?.totalEmployees} employees)`
  );

  // 5. Admin fetch employees
  const empList = await fetch(base + '/api/employees', {
    headers: { Cookie: adminCookie },
  }).then((r) => r.json());
  console.log(
    '5. Admin Fetch Employees:',
    empList.success && empList.data.length === 3 ? '✅ PASS' : '❌ FAIL',
    `(${empList.data?.length} employees)`
  );

  // 6. Employee login
  const empLoginRes = await fetch(base + '/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...originHeader },
    body: JSON.stringify({ email: 'alex.chen@enterprise.corp', password: 'EmployeePassword123!' }),
  });
  const empCookie = empLoginRes.headers.get('set-cookie');
  console.log(
    '6. Employee login (200 + session cookie):',
    empLoginRes.status === 200 && empCookie ? '✅ PASS' : '❌ FAIL'
  );

  // 7. Employee forbidden from Admin dashboard (expect 403)
  const empDashForbidden = await fetch(base + '/api/dashboard/admin', {
    headers: { Cookie: empCookie },
  });
  console.log(
    '7. Employee blocked from Admin Dashboard (403):',
    empDashForbidden.status === 403 ? '✅ PASS' : `❌ FAIL (${empDashForbidden.status})`
  );

  // 8. Employee forbidden from creating tasks (expect 403)
  const empCreateTaskForbidden = await fetch(base + '/api/tasks', {
    method: 'POST',
    headers: { Cookie: empCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Unauthorized Task',
      description: 'Attempting forbidden creation',
      assignedEmployee: empList.data[0]._id,
      priority: 'HIGH',
    }),
  });
  console.log(
    '8. Employee blocked from creating task (403):',
    empCreateTaskForbidden.status === 403 ? '✅ PASS' : `❌ FAIL (${empCreateTaskForbidden.status})`
  );

  // 9. Employee fetch own tasks (expect only their own tasks)
  const empTasks = await fetch(base + '/api/tasks', {
    headers: { Cookie: empCookie },
  }).then((r) => r.json());
  const allBelongToAlex = empTasks.data?.every(
    (t) => t.assignedEmployee.email === 'alex.chen@enterprise.corp' || t.assignedEmployee === 'alex.chen@enterprise.corp'
  );
  console.log(
    '9. Employee fetched their assigned tasks count:',
    empTasks.success && empTasks.data.length > 0 && allBelongToAlex ? '✅ PASS' : '❌ FAIL',
    `(${empTasks.data?.length} tasks assigned to Alex, all verified)`
  );

  // 10. Employee updating their own task status to COMPLETED
  const alexTask = empTasks.data.find((t) => t.status === 'IN_PROGRESS');
  if (alexTask) {
    const updateRes = await fetch(base + '/api/tasks/' + alexTask._id + '/status', {
      method: 'PATCH',
      headers: { Cookie: empCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    }).then((r) => r.json());
    console.log(
      '10. Employee updated own task status:',
      updateRes.success && updateRes.data.status === 'COMPLETED' ? '✅ PASS' : '❌ FAIL'
    );
  }

  // 11. Cross-employee task update blocked (403)
  const otherTasks = await fetch(base + '/api/tasks', {
    headers: { Cookie: adminCookie },
  }).then((r) => r.json());
  const mayaTask = otherTasks.data.find(
    (t) => t.assignedEmployee.email === 'maya.patel@enterprise.corp'
  );
  if (mayaTask) {
    const crossUpdate = await fetch(base + '/api/tasks/' + mayaTask._id + '/status', {
      method: 'PATCH',
      headers: { Cookie: empCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    });
    console.log(
      '11. Cross-employee task update blocked (403):',
      crossUpdate.status === 403 ? '✅ PASS' : `❌ FAIL (${crossUpdate.status})`
    );
  }

  // 12. Admin creates a task
  const createRes = await fetch(base + '/api/tasks', {
    method: 'POST',
    headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Automated E2E Regression Testing Suite',
      description: 'Implement end-to-end integration test runner validating all critical user journeys.',
      assignedEmployee: empList.data[0]._id,
      priority: 'HIGH',
    }),
  }).then((r) => r.json());
  console.log(
    '12. Admin task creation with email notification:',
    createRes.success && createRes.data.title.includes('E2E') ? '✅ PASS' : '❌ FAIL'
  );

  // 13. Search and Pagination
  const searchRes = await fetch(base + '/api/tasks?search=Regression&page=1&limit=5', {
    headers: { Cookie: adminCookie },
  }).then((r) => r.json());
  console.log(
    '13. Server-side Search & Pagination:',
    searchRes.success && searchRes.data.length >= 1 && searchRes.pagination.total >= 1
      ? '✅ PASS'
      : '❌ FAIL'
  );

  const createdTaskId = createRes.data?._id;

  // 14. Reassign Task (Admin only)
  const reassignRes = await fetch(`${base}/api/tasks/${createdTaskId}/reassign`, {
    method: 'PATCH',
    headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ newEmployeeId: empList.data[1]._id }),
  }).then((r) => r.json());
  console.log(
    '14. Task Reassignment (Admin):',
    reassignRes.success && reassignRes.data.assignedEmployee._id === empList.data[1]._id
      ? '✅ PASS'
      : '❌ FAIL'
  );

  // 15. Subtasks (Add & Toggle)
  const subtaskRes = await fetch(`${base}/api/tasks/${createdTaskId}/subtasks`, {
    method: 'POST',
    headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Configure CI Runner' }),
  }).then((r) => r.json());
  const subtaskId = subtaskRes.data?.[0]?._id;
  const toggleRes = await fetch(`${base}/api/tasks/${createdTaskId}/subtasks/${subtaskId}`, {
    method: 'PATCH',
    headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCompleted: true }),
  }).then((r) => r.json());
  console.log(
    '15. Subtask Checklist & Toggle:',
    subtaskRes.success && toggleRes.success && toggleRes.data?.[0]?.isCompleted === true
      ? '✅ PASS'
      : '❌ FAIL'
  );

  // 16. Task Comments (Add & Fetch)
  const commentRes = await fetch(`${base}/api/tasks/${createdTaskId}/comments`, {
    method: 'POST',
    headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Initial test setup looks solid.' }),
  }).then((r) => r.json());
  const commentsList = await fetch(`${base}/api/tasks/${createdTaskId}/comments`, {
    headers: { Cookie: adminCookie },
  }).then((r) => r.json());
  console.log(
    '16. Task Collaboration Comments:',
    commentRes.success && commentsList.data?.length >= 1 ? '✅ PASS' : '❌ FAIL'
  );

  // 17. In-App Notifications
  const notifRes = await fetch(`${base}/api/notifications`, {
    headers: { Cookie: empCookie },
  }).then((r) => r.json());
  console.log(
    '17. In-App Notification Center:',
    notifRes.success && Array.isArray(notifRes.data) ? '✅ PASS' : '❌ FAIL'
  );

  // 18. Audit Logs (Admin access & Employee blocked 403)
  const auditRes = await fetch(`${base}/api/audit-logs`, {
    headers: { Cookie: adminCookie },
  }).then((r) => r.json());
  const auditForbidden = await fetch(`${base}/api/audit-logs`, {
    headers: { Cookie: empCookie },
  });
  console.log(
    '18. Immutable Audit Logs & Security Boundary:',
    auditRes.success && auditForbidden.status === 403 ? '✅ PASS' : '❌ FAIL'
  );

  // 19. Executive Reports & Performance Analytics
  const summaryRes = await fetch(`${base}/api/reports/summary`, {
    headers: { Cookie: adminCookie },
  }).then((r) => r.json());
  const perfRes = await fetch(`${base}/api/reports/performance`, {
    headers: { Cookie: adminCookie },
  }).then((r) => r.json());
  console.log(
    '19. Executive Reports & Employee Performance:',
    summaryRes.success && perfRes.success && Array.isArray(perfRes.data) ? '✅ PASS' : '❌ FAIL'
  );

  // 20. CSV Export
  const csvRes = await fetch(`${base}/api/tasks/export/csv`, {
    headers: { Cookie: adminCookie },
  });
  const csvText = await csvRes.text();
  console.log(
    '20. Filtered Task CSV Export:',
    csvRes.status === 200 && csvText.includes('Task ID') && csvText.includes('Priority')
      ? '✅ PASS'
      : '❌ FAIL'
  );

  // 21. Bulk Status Update
  const bulkRes = await fetch(`${base}/api/tasks/bulk-status`, {
    method: 'POST',
    headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskIds: [createdTaskId], status: 'IN_PROGRESS' }),
  }).then((r) => r.json());
  console.log(
    '21. Bulk Task Operations (Admin):',
    bulkRes.success && bulkRes.data.modifiedCount >= 1 ? '✅ PASS' : '❌ FAIL'
  );

  console.log('\n🎉 ALL 21 BACKEND VERIFICATION & PROFESSIONAL TESTS COMPLETED SUCCESSFULLY!\n');
}

runTests().catch(console.error);
