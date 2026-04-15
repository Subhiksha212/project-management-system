export const dashboardData = {
  director: {
    profile: {
      name: 'Dr. Rajesh Mehta',
      role: 'Director',
      subtitle: 'Director',
      initials: 'DR',
    },
    header: {
      title: 'Director Overview',
      subtitle: 'Tuesday, 15 April 2026 · Academic Year 2025–26',
    },
    kpis: [
      { icon: '📁', bg: '#eef2ff', color: '#1a3faa', value: '48', label: 'Total Projects', trend: 'up', trendTxt: '↑ 12%' },
      { icon: '👥', bg: '#e0f2fe', color: '#0369a1', value: '312', label: 'Active Students', trend: 'up', trendTxt: '↑ 8%' },
      { icon: '✔', bg: '#dcfce7', color: '#15803d', value: '29', label: 'Completed', trend: 'up', trendTxt: '↑ 5%' },
      { icon: '⚠', bg: '#fee2e2', color: '#b91c1c', value: '7', label: 'At Risk', trend: 'down', trendTxt: '+2 this week' },
    ],
    projects: [
      { name: 'AI Healthcare Monitor', coord: 'Dr. Priya S.', n: 6, pct: 78, color: '#16a34a', dl: 'Jun 30', badge: 'badge-green', status: 'On Track' },
      { name: 'Smart Campus IoT', coord: 'Prof. Arjun V.', n: 8, pct: 52, color: '#d97706', dl: 'May 15', badge: 'badge-amber', status: 'At Risk' },
      { name: 'Blockchain Voting', coord: 'Dr. Meena K.', n: 4, pct: 91, color: '#16a34a', dl: 'Apr 28', badge: 'badge-green', status: 'On Track' },
      { name: 'NLP Sentiment Tool', coord: 'Prof. Ravi T.', n: 5, pct: 33, color: '#dc2626', dl: 'Apr 20', badge: 'badge-red', status: 'Delayed' },
      { name: 'E-Commerce Platform', coord: 'Dr. Latha R.', n: 7, pct: 65, color: '#16a34a', dl: 'Jul 10', badge: 'badge-green', status: 'On Track' },
    ],
    departments: [
      { name: 'Computer Science', pct: 72, color: '#1a3faa' },
      { name: 'Electronics', pct: 58, color: '#0369a1' },
      { name: 'Mechanical', pct: 41, color: '#d97706' },
      { name: 'Civil', pct: 85, color: '#16a34a' },
      { name: 'IT', pct: 66, color: '#1a3faa' },
    ],
    activities: [
      { dot: '#1a3faa', text: 'AI Healthcare Monitor — Phase 2 report submitted', time: '2h ago' },
      { dot: '#dc2626', text: 'NLP Sentiment Tool — missed milestone', time: '5h ago' },
      { dot: '#0369a1', text: '3 students joined Smart Campus IoT', time: 'Yesterday' },
      { dot: '#16a34a', text: 'Blockchain Voting — demo scheduled Apr 28', time: '2d ago' },
      { dot: '#d97706', text: 'Budget review meeting — May 5', time: '2d ago' },
    ],
  },
  coordinator: {
    profile: {
      name: 'Dr. Priya Sharma',
      role: 'Coordinator',
      subtitle: 'Coordinator',
      initials: 'PS',
    },
    header: {
      title: 'Coordinator Dashboard',
      subtitle: 'Tuesday, 15 April 2026 · 3 Active Projects',
    },
    kpis: [
      { icon: '📁', bg: '#eef2ff', color: '#1a3faa', value: '3', label: 'My Projects', trend: 'up', trendTxt: 'Active' },
      { icon: '🎓', bg: '#e0f2fe', color: '#0369a1', value: '19', label: 'My Students', trend: 'up', trendTxt: '↑ 3' },
      { icon: '✔', bg: '#dcfce7', color: '#15803d', value: '11', label: 'Tasks Done', trend: 'up', trendTxt: '80%' },
      { icon: '⏳', bg: '#fef9c3', color: '#a16207', value: '4', label: 'Pending Reviews', trend: 'down', trendTxt: 'Due soon' },
    ],
    projects: [
      { title: 'AI Healthcare Monitor', badge: 'badge-green', status: 'On Track', desc: 'Deep learning model for real-time patient vitals anomaly detection using LSTM networks.', n: 6, dl: 'Jun 30', pct: 78, color: '#16a34a' },
      { title: 'Smart Campus IoT', badge: 'badge-amber', status: 'At Risk', desc: 'IoT-based automation of campus resources and energy optimization system.', n: 8, dl: 'May 15', pct: 52, color: '#d97706' },
      { title: 'Blockchain Voting', badge: 'badge-green', status: 'On Track', desc: 'Decentralized tamper-proof student election management on blockchain.', n: 5, dl: 'Apr 28', pct: 91, color: '#16a34a' },
    ],
    reviews: [
      { dot: '#d97706', name: 'Aanya Singh', task: 'Phase 2 Report (AI Healthcare)', time: 'Due today' },
      { dot: '#1a3faa', name: 'Rohit Pillai', task: 'Hardware Integration Demo', time: 'Apr 17' },
      { dot: '#0369a1', name: 'Kavitha R.', task: 'Smart Contract Testing', time: 'Apr 18' },
      { dot: '#dc2626', name: 'Team IoT-B', task: 'Algorithm Design Doc', time: 'Overdue' },
    ],
    schedule: [
      { day: '15', mon: 'APR', title: 'Phase 2 Review — AI Healthcare', loc: '2:00 PM · Conference Room B' },
      { day: '17', mon: 'APR', title: 'IoT Hardware Demo', loc: '10:30 AM · Lab 204' },
      { day: '18', mon: 'APR', title: 'Blockchain Code Review', loc: '3:00 PM · Online (Meet)' },
    ],
  },
  student: {
    profile: {
      name: 'Aanya Singh',
      role: 'Student',
      subtitle: 'Student · CS-B',
      initials: 'AS',
    },
    header: {
      title: 'My Workspace',
      subtitle: 'Tuesday, 15 April 2026 · AI Healthcare Monitor',
    },
    kpis: [
      { icon: '📋', bg: '#eef2ff', color: '#1a3faa', value: '8', label: 'Total Tasks', trend: 'up', trendTxt: 'Active' },
      { icon: '✔', bg: '#dcfce7', color: '#15803d', value: '5', label: 'Completed', trend: 'up', trendTxt: '62%' },
      { icon: '⏳', bg: '#fef9c3', color: '#a16207', value: '2', label: 'In Progress', trend: 'up', trendTxt: 'On time' },
      { icon: '⚠', bg: '#fee2e2', color: '#b91c1c', value: '1', label: 'Due Today', trend: 'down', trendTxt: 'Urgent' },
    ],
    project: {
      title: 'AI Healthcare Monitor',
      status: 'On Track',
      desc: 'A deep learning based system that continuously monitors patient vitals and raises alerts for anomalies using LSTM neural networks and edge computing.',
      coordinator: 'Dr. Priya Sharma',
      deadline: 'June 30, 2026',
      teamSize: '6 Members',
      department: 'Computer Science',
      progress: 78,
      milestones: [
        { text: 'Literature Review', state: 'done' },
        { text: 'Data Collection', state: 'done' },
        { text: 'Model Architecture', state: 'done' },
        { text: 'Phase 2 Report', state: 'active' },
        { text: 'Final Demo', state: 'todo' },
      ],
    },
    tasks: [
      { cls: 'done', check: '✓', checkCls: '', title: 'Dataset preprocessing script', sub: 'Completed Apr 10', urgent: false },
      { cls: 'done', check: '✓', checkCls: '', title: 'LSTM model baseline training', sub: 'Completed Apr 12', urgent: false },
      { cls: 'active', check: '⟳', checkCls: 'in-prog', title: 'Phase 2 report document', sub: 'Due Today', urgent: true },
      { cls: 'active', check: '⟳', checkCls: 'in-prog', title: 'Model accuracy optimization', sub: 'Due Apr 20', urgent: false },
      { cls: 'todo', check: '○', checkCls: 'empty', title: 'Edge deployment setup', sub: 'Due May 5', urgent: false },
      { cls: 'todo', check: '○', checkCls: 'empty', title: 'Final presentation slides', sub: 'Due Jun 25', urgent: false },
    ],
    announcements: [
      { dot: '#dc2626', text: 'URGENT: Phase 2 report due today at 5 PM.', time: 'Now' },
      { dot: '#1a3faa', text: 'Review session scheduled Apr 17 at 2 PM.', time: '1d ago' },
      { dot: '#0369a1', text: 'Model accuracy must exceed 93% before final demo.', time: '2d ago' },
      { dot: '#16a34a', text: 'Team meeting with Dr. Priya — Lab 204, Apr 18, 10 AM', time: '2d ago' },
    ],
  },
}