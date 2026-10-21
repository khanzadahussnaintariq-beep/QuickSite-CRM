
export interface Project {
    id: string;
    title: string;
    client: string;
    status: string;
    priority: string;
    dueDate: string;
    progress: number;
    budgetType: string;
    price: string;
    weeklyHours?: number;
    hourlyRate?: number;
    description: string;
    tags: string[];
    team: string[];
    userProjectId?: string;
}

export type Client = {
    id: string; // Internal db id
    clientId: string; // User-facing ID (e.g., CLT-001)
    name: string; // Contact Person
    company: string;
    email: string;
    phone: string;
    address?: string;
    industry?: string;
    tier?: string;
    website?: string;
    status: 'Active' | 'Inactive' | 'Prospect' | 'Ongoing' | 'Completed';
    preferredContact: 'Email' | 'WhatsApp' | 'Slack' | 'Phone';
    notes?: string;
}

export type Payment = {
    id: string;
    clientId: string;
    projectId?: string;
    totalAmount: number;
    paidAmount: number;
    status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
    date: string;
    dueDate: string;
    invoiceRef: string;
    method: 'Wire Transfer' | 'Stripe' | 'PayPal' | 'Crypto' | 'Credit Card';
}

export type Milestone = {
    id: string;
    clientId: string;
    projectId: string;
    title: string;
    dueDate: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
    paymentLinked: boolean;
}

export type TicketStatus = 'New' | 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent';
export type TicketType = 'Question' | 'Problem' | 'Feature Request' | 'Bug' | 'Refund';

export interface Ticket {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    type: TicketType;
    source: string;
    createdById: string;
    customerId: string;
    assignedToId?: string;
    assignedTo?: string;
    projectId?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    slaDeadline?: string;
    lastMessage?: string;
    dueDate?: string;
}


export interface User {
    id: string;
    name: string;
    role: string;
    avatar: string;
    email: string;
    phone: string;
    salary: number;
    joinDate: string;
    status: 'Active' | 'Inactive' | 'Away';
    department: string;
    panelAccess: boolean;
    accessRole: 'Admin' | 'Manager' | 'Developer' ;
    lastLogin: string;
}


export type Meeting = {
    id: string;
    title: string;
    type: 'Internal' | 'Client Related' | 'Project Related' | 'Other';
    relatedClient?: string; // ID of the Client
    relatedProject?: string; // ID of the Project
    department?: string;
    link: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM AM/PM
    duration: string; // e.g., '45m', '1h'
    assignedTo: string; // ID of the User
    organizer: string; // ID of the User
    purpose: string;
    agenda?: string;
    status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled';
}

export const USERS: User[] = [
    { id: '1', name: 'Alice', role: 'Developer', avatar: 'A', email: 'alice@quicksite.local', phone: '+1 234 567 8901', salary: 120000, joinDate: '2023-01-15', status: 'Active', department: 'Engineering', panelAccess: true, accessRole: 'Developer', lastLogin: '2024-03-30T09:15:00Z' },
    { id: '2', name: 'Charlie', role: 'Manager', avatar: 'C', email: 'charlie@quicksite.local', phone: '+1 234 567 8903', salary: 145000, joinDate: '2022-09-01', status: 'Active', department: 'Management', panelAccess: true, accessRole: 'Manager', lastLogin: '2024-03-30T10:05:00Z' },
    { id: '3', name: 'David', role: 'Developer', avatar: 'D', email: 'david@quicksite.local', phone: '+1 234 567 8904', salary: 115000, joinDate: '2023-06-10', status: 'Away', department: 'Engineering', panelAccess: false, accessRole: 'Developer', lastLogin: '2024-02-15T08:30:00Z' },
];

export const PROJECTS: Project[] = [
    {
        id: '1',
        title: 'E-commerce Redesign',
        client: 'TechCorp',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2024-03-15',
        progress: 65,
        budgetType: 'Fixed',
        price: '15000',
        description: 'Complete redesign of the main e-commerce platform including mobile responsiveness.',
        tags: ['React', 'Next.js', 'Tailwind'],
        team: ['Alice', 'Bob'],
        userProjectId: 'Ashar'
    },
    {
        id: '2',
        title: 'CRM Integration',
        client: 'SalesForce Plus',
        status: 'Planning',
        priority: 'Medium',
        dueDate: '2024-04-01',
        progress: 10,
        budgetType: 'Hourly',
        price: '85',
        description: 'Integration of third-party CRM tools with the internal dashboard.',
        tags: ['API', 'Node.js'],
        team: ['Charlie'],
        userProjectId: 'Muhammad Daiyn'
    },
    {
        id: '3',
        title: 'Mobile App MVP',
        client: 'StartupInc',
        status: 'Done',
        priority: 'Critical',
        dueDate: '2024-01-20',
        progress: 100,
        budgetType: 'Milestone',
        price: '25000',
        description: 'MVP development for the new social fitness app.',
        tags: ['React Native', 'Firebase'],
        team: ['Alice', 'David'],
        userProjectId: 'Ashar'
    },
    {
        id: '4',
        title: 'Marketing Website',
        client: 'GrowthGurus',
        status: 'In Progress',
        priority: 'Low',
        dueDate: '2024-02-28',
        progress: 45,
        budgetType: 'Fixed',
        price: '5000',
        description: 'Landing page and blog implementation for improved SEO.',
        tags: ['Next.js', 'SEO'],
        team: ['Eve'],
        userProjectId: 'Muhammad Daiyn'
    }
];



export const CLIENTS: Client[] = [
    {
        id: '1',
        clientId: 'CLT-1001',
        name: 'John Smith',
        company: 'TechCorp',
        email: 'john@techcorp.com',
        phone: '+1 555-0101',
        address: '123 Tech Lane, Silicon Valley, CA 94025',
        industry: 'Software Development',
        tier: 'Enterprise',
        website: 'techcorp.com',
        status: 'Active',
        preferredContact: 'Email',
        notes: 'VIP Client. Always CC the lead engineer on technical updates.'
    },
    {
        id: '2',
        clientId: 'CLT-1002',
        name: 'Sarah Connor',
        company: 'SalesForce Plus',
        email: 'sarah@sfplus.com',
        phone: '+1 555-0102',
        address: '445 Enterprise Way, Austin, TX 73301',
        industry: 'CRM & Enterprise',
        tier: 'Premium',
        website: 'sfplus.com',
        status: 'Ongoing',
        preferredContact: 'Slack',
        notes: 'Prefers quick daily updates via Slack over formal emails.'
    },
    {
        id: '3',
        clientId: 'CLT-1003',
        name: 'Mike Ross',
        company: 'StartupInc',
        email: 'mike@startupinc.com',
        phone: '+1 555-0103',
        address: 'New York, NY 10001',
        industry: 'FinTech',
        tier: 'Starter',
        website: 'startupinc.com',
        status: 'Prospect',
        preferredContact: 'WhatsApp',
        notes: 'Currently exploring options. Follow up next month regarding the MVP deployment.'
    },
    {
        id: '4',
        clientId: 'CLT-1004',
        name: 'Emma Watson',
        company: 'GrowthGurus',
        email: 'emma@growthgurus.io',
        phone: '+1 555-0104',
        address: 'Remote',
        industry: 'Digital Marketing',
        tier: 'Premium',
        website: 'growthgurus.io',
        status: 'Active',
        preferredContact: 'Phone',
        notes: 'Quarterly billing schedule. Send invoices to accounting@growthgurus.io.'
    }
];

export const PAYMENTS: Payment[] = [
    { id: 'pay_1', clientId: '1', projectId: '1', totalAmount: 15000, paidAmount: 15000, status: 'Paid', date: '2024-01-10', dueDate: '2024-01-10', invoiceRef: 'INV-2024-001', method: 'Wire Transfer' },
    { id: 'pay_2', clientId: '1', projectId: '1', totalAmount: 10000, paidAmount: 5000, status: 'Partial', date: '2024-02-15', dueDate: '2024-03-01', invoiceRef: 'INV-2024-002', method: 'Stripe' },
    { id: 'pay_3', clientId: '2', projectId: '2', totalAmount: 12000, paidAmount: 0, status: 'Pending', date: '', dueDate: '2024-03-15', invoiceRef: 'INV-2024-003', method: 'Credit Card' },
    { id: 'pay_4', clientId: '3', projectId: '3', totalAmount: 25000, paidAmount: 12500, status: 'Overdue', date: '2024-01-05', dueDate: '2024-02-05', invoiceRef: 'INV-2024-004', method: 'Wire Transfer' },
    { id: 'pay_5', clientId: '4', projectId: '4', totalAmount: 5000, paidAmount: 5000, status: 'Paid', date: '2024-01-20', dueDate: '2024-01-25', invoiceRef: 'INV-2024-005', method: 'PayPal' },
];

export const MILESTONES: Milestone[] = [
    { id: 'm_1', clientId: '1', projectId: '1', title: 'UI/UX Design Sign-off', dueDate: '2024-01-20', status: 'Completed', paymentLinked: true },
    { id: 'm_2', clientId: '1', projectId: '1', title: 'Frontend MVP Delivery', dueDate: '2024-02-15', status: 'In Progress', paymentLinked: false },
    { id: 'm_3', clientId: '1', projectId: '1', title: 'Backend API Integration', dueDate: '2024-03-01', status: 'Pending', paymentLinked: true },
    { id: 'm_4', clientId: '2', projectId: '2', title: 'Data Migration Strategy', dueDate: '2024-03-10', status: 'In Progress', paymentLinked: false },
    { id: 'm_5', clientId: '3', projectId: '3', title: 'iOS App Store Submission', dueDate: '2024-02-01', status: 'Completed', paymentLinked: true },
    { id: 'm_6', clientId: '4', projectId: '4', title: 'SEO Audit Delivery', dueDate: '2024-02-28', status: 'Blocked', paymentLinked: false },
];

export interface TicketComment {
    id: string;
    ticketId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    isInternal: boolean;
    timestamp: string;
    attachments?: string[];
}

export const TICKETS: Ticket[] = [
    {
        id: '1',
        ticketNumber: 'TKT-2024-001',
        title: 'Login page loading slowly',
        description: 'The login page takes more than 10 seconds to load in the production environment.',
        status: 'Open',
        priority: 'High',
        type: 'Problem',
        source: 'Portal',
        createdById: '1',
        customerId: '1',
        assignedToId: '1',
        projectId: '1',
        createdAt: '2024-01-10T10:30:00Z',
        updatedAt: '2024-01-10T11:00:00Z',
        tags: ['performance', 'frontend'],
        slaDeadline: '2024-01-11T10:30:00Z',
        lastMessage: 'I am looking into the database queries.',
        dueDate: '2024-01-15'
    },
    {
        id: '2',
        ticketNumber: 'TKT-2024-002',
        title: 'Broken link in footer',
        description: 'The "Terms and Service" link in the footer leads to a 404 page.',
        status: 'Resolved',
        priority: 'Low',
        type: 'Bug',
        source: 'Email',
        createdById: '2',
        customerId: '1',
        assignedToId: '2',
        projectId: '1',
        createdAt: '2024-01-05T09:15:00Z',
        updatedAt: '2024-01-05T14:20:00Z',
        tags: ['ui', 'links'],
        lastMessage: 'Fixed the link and verified deployment.',
        dueDate: '2024-01-08'
    },
    {
        id: '3',
        ticketNumber: 'TKT-2024-003',
        title: 'API authentication failure',
        description: 'Receiving 401 Unauthorized errors even with valid tokens on the /api/v1/sync endpoint.',
        status: 'In Progress',
        priority: 'Critical',
        type: 'Problem',
        source: 'API',
        createdById: '3',
        customerId: '2',
        assignedToId: '1',
        projectId: '2',
        createdAt: '2024-01-11T08:00:00Z',
        updatedAt: '2024-01-11T09:45:00Z',
        tags: ['security', 'api'],
        slaDeadline: '2024-01-11T10:00:00Z',
        lastMessage: 'Checking the token validation logic in auth middleware.',
        dueDate: '2024-01-13'
    },
    {
        id: '4',
        ticketNumber: 'TKT-2024-004',
        title: 'New Feature: Dark Mode',
        description: 'Customer requested a full dark mode interface for the dashboard.',
        status: 'Pending',
        priority: 'Medium',
        type: 'Feature Request',
        source: 'Portal',
        createdById: '4',
        customerId: '3',
        assignedToId: '1',
        projectId: '3',
        createdAt: '2024-01-12T15:00:00Z',
        updatedAt: '2024-01-12T15:30:00Z',
        tags: ['feature', 'design'],
        lastMessage: 'Waiting for design approval.',
        dueDate: '2024-01-20'
    },
    {
        id: '5',
        ticketNumber: 'TKT-2024-005',
        title: 'Payment gateway timeout',
        description: 'Stripe checkout is timing out for transactions above $500. Users get a blank page after 30s.',
        status: 'New',
        priority: 'Urgent',
        type: 'Problem',
        source: 'Email',
        createdById: '1',
        customerId: '4',
        assignedToId: '1',
        projectId: '4',
        createdAt: '2024-01-13T09:00:00Z',
        updatedAt: '2024-01-13T09:00:00Z',
        tags: ['payments', 'critical'],
        slaDeadline: '2024-01-13T15:00:00Z',
        dueDate: '2024-01-14'
    },
    {
        id: '6',
        ticketNumber: 'TKT-2024-006',
        title: 'Dashboard chart not rendering',
        description: 'The revenue chart on the main dashboard shows a blank area. Console shows a Recharts error.',
        status: 'In Progress',
        priority: 'High',
        type: 'Bug',
        source: 'Portal',
        createdById: '2',
        customerId: '1',
        assignedToId: '1',
        projectId: '1',
        createdAt: '2024-01-14T11:20:00Z',
        updatedAt: '2024-01-14T14:00:00Z',
        tags: ['frontend', 'charts'],
        dueDate: '2024-01-17'
    },
    {
        id: '7',
        ticketNumber: 'TKT-2024-007',
        title: 'Export CSV not working',
        description: 'The export button on the clients page produces a corrupted CSV file with missing headers.',
        status: 'Open',
        priority: 'Medium',
        type: 'Bug',
        source: 'Portal',
        createdById: '3',
        customerId: '2',
        assignedToId: '1',
        projectId: '2',
        createdAt: '2024-01-14T16:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        tags: ['export', 'data'],
        dueDate: '2024-01-18'
    },
    {
        id: '8',
        ticketNumber: 'TKT-2024-008',
        title: 'Add bulk email feature',
        description: 'Need the ability to send promotional emails to multiple clients at once from the CRM.',
        status: 'Pending',
        priority: 'Low',
        type: 'Feature Request',
        source: 'Portal',
        createdById: '4',
        customerId: '3',
        assignedToId: '1',
        projectId: '3',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        tags: ['feature', 'email'],
        dueDate: '2024-02-01'
    },
    {
        id: '9',
        ticketNumber: 'TKT-2024-009',
        title: 'Mobile responsive issues',
        description: 'Sidebar overlaps content on screens smaller than 768px. Navigation is unusable on phones.',
        status: 'Closed',
        priority: 'High',
        type: 'Bug',
        source: 'Email',
        createdById: '1',
        customerId: '4',
        assignedToId: '1',
        projectId: '4',
        createdAt: '2024-01-08T13:00:00Z',
        updatedAt: '2024-01-12T17:00:00Z',
        tags: ['responsive', 'mobile'],
        dueDate: '2024-01-12'
    },
    {
        id: '10',
        ticketNumber: 'TKT-2024-010',
        title: 'Notification bell not updating',
        description: 'New notifications are not appearing in real-time. Users have to refresh the page to see updates.',
        status: 'New',
        priority: 'Medium',
        type: 'Problem',
        source: 'Portal',
        createdById: '2',
        customerId: '1',
        assignedToId: '1',
        projectId: '1',
        createdAt: '2024-01-16T08:45:00Z',
        updatedAt: '2024-01-16T08:45:00Z',
        tags: ['realtime', 'notifications'],
        dueDate: '2024-01-19'
    }
];

export const TICKET_COMMENTS: Record<string, TicketComment[]> = {
    '1': [
        {
            id: 'c1',
            ticketId: '1',
            authorId: '1',
            authorName: 'Alice',
            authorAvatar: 'A',
            content: 'I have started analyzing the network logs.',
            isInternal: true,
            timestamp: '2024-01-10T10:45:00Z'
        },
        {
            id: 'c2',
            ticketId: '1',
            authorId: '1',
            authorName: 'Alice',
            authorAvatar: 'A',
            content: 'I am looking into the database queries.',
            isInternal: false,
            timestamp: '2024-01-10T11:00:00Z'
        }
    ],
    '3': [
        {
            id: 'c3',
            ticketId: '3',
            authorId: '3',
            authorName: 'Charlie',
            authorAvatar: 'C',
            content: 'Checking the token validation logic in auth middleware.',
            isInternal: false,
            timestamp: '2024-01-11T09:45:00Z'
        }
    ]
};

export const MEETINGS: Meeting[] = [
    {
        id: '1',
        title: 'Weekly Sprint Planning',
        type: 'Internal',
        department: 'Engineering',
        link: 'https://zoom.us/j/123456789',
        date: '2024-01-15',
        time: '10:00 AM',
        duration: '1h',
        assignedTo: '1', // Alice
        organizer: '3', // Charlie
        purpose: 'Review sprint progress and assign new tickets.',
        agenda: '- Standup\n- Review Blocked Tasks\n- Assign new backlog items',
        status: 'Completed'
    },
    {
        id: '2',
        title: 'Client Review - TechCorp',
        type: 'Client Related',
        relatedClient: '1', // TechCorp ID
        link: 'https://meet.google.com/abc-defg-hij',
        date: '2024-01-16',
        time: '02:00 PM',
        duration: '45m',
        assignedTo: '3', // Charlie
        organizer: '1', // Alice
        purpose: 'Present the latest design iteration to the client stakeholders.',
        agenda: '- Present Figma Prototype\n- Collect Feedback\n- Discuss Next Milestone',
        status: 'Upcoming'
    },
    {
        id: '3',
        title: 'API Architecture Discussion',
        type: 'Project Related',
        relatedProject: '2', // CRM Integration
        link: 'https://teams.microsoft.com/l/meetup-join/abc123',
        date: '2024-01-17',
        time: '11:30 AM',
        duration: '30m',
        assignedTo: '1', // Alice
        organizer: '2', // Bob
        purpose: 'Finalize the endpoints mapping for the new CRM ingestion service.',
        status: 'Upcoming'
    },
    {
        id: '4',
        title: 'Discovery Call: StartupInc',
        type: 'Client Related',
        relatedClient: '3', // StartupInc
        link: 'https://zoom.us/j/987654321',
        date: '2024-01-20',
        time: '03:00 PM',
        duration: '1h',
        assignedTo: '3', // Charlie
        organizer: '3', // Charlie
        purpose: 'Initial introduction and requirements gathering for their MVP mobile app.',
        agenda: '1. Introductions\n2. App Goals\n3. Timeline expectations\n4. Q&A',
        status: 'Rescheduled'
    }
];

export const CHANNELS = [
    { id: '1', name: 'general', description: 'General discussion' },
    { id: '2', name: 'design', description: 'Design related talks' },
    { id: '3', name: 'development', description: 'Technical discussions' }
];

export interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    channelId?: string;
    attachments?: any[];
    reactions: { emoji: string; userIds: string[] }[];
    isPinned?: boolean;
}

export const MESSAGES: Message[] = [
    {
        id: 'm_old_1',
        senderId: '1',
        content: 'Hey team, let’s start the planning for the new sprint.',
        createdAt: '2024-02-10T09:00:00Z',
        channelId: '1',
        reactions: []
    },
    {
        id: 'm_old_2',
        senderId: '3',
        content: 'I have prepared the initial backlog.',
        createdAt: '2024-02-12T14:30:00Z',
        channelId: '1',
        reactions: []
    },
    {
        id: 'm_yesterday_1',
        senderId: '2',
        content: 'Did someone review the PR for the login page?',
        createdAt: '2024-02-18T16:20:00Z',
        channelId: '1',
        reactions: [{ emoji: '👀', userIds: ['1'] }]
    },
    {
        id: 'm1',
        senderId: '1',
        content: 'Welcome to the project! **Excited** to get started.',
        createdAt: '2026-02-19T01:00:00Z',
        channelId: '1',
        reactions: [{ emoji: '🚀', userIds: ['2', '3'] }]
    },
    {
        id: 'm2',
        senderId: '2',
        content: 'Thanks Alice! I have uploaded the initial designs in the Files tab.',
        createdAt: '2026-02-19T01:05:00Z',
        channelId: '1',
        reactions: []
    },
    {
        id: 'm3',
        senderId: '3',
        content: 'I will start on the API integration tomorrow morning.',
        createdAt: '2026-02-19T01:10:00Z',
        channelId: '1',
        reactions: [{ emoji: '✅', userIds: ['1'] }]
    },
    {
        id: 'm4',
        senderId: '1',
        content: 'Great. Also, we need to finalize the color palette for the dark mode.',
        createdAt: '2026-02-19T01:15:00Z',
        channelId: '1',
        reactions: []
    },
    {
        id: 'm5',
        senderId: '2',
        content: 'I’m on it! Will share some variations in an hour.',
        createdAt: '2026-02-19T01:20:00Z',
        channelId: '1',
        reactions: [{ emoji: '🎨', userIds: ['1', '3'] }]
    }
];


export const PROJECT_MEMBERS = [
    { id: '1', name: 'Alice', role: 'Lead', online: true },
    { id: '2', name: 'Bob', role: 'Designer', online: true },
    { id: '3', name: 'Charlie', role: 'Dev', online: false }
];

export const THREAD_MESSAGES: Record<string, any[]> = {
    'm1': [
        {
            id: 'tm1',
            senderId: '2',
            content: 'Agreed! Let’s crush it.',
            createdAt: '2024-01-10T10:02:00Z'
        }
    ]
};

