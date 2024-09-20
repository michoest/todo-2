module.exports = {
    accounts: [
        { description: 'Work Account' },
        { description: 'Personal Account' },
        { description: 'Project A Account' },
        { description: 'Project B Account' }
    ],
    users: [
        { email: 'john@example.com', name: { first: 'John', last: 'Doe' }, password: 'john', accountIndices: [0, 1] },
        { email: 'jane@example.com', name: { first: 'Jane', last: 'Smith' }, password: 'jane', accountIndices: [2, 3] },
        { email: 'bob@example.com', name: { first: 'Bob', last: 'Johnson' }, password: 'bob', accountIndices: [1, 2] }
    ],
    tasks: [
        {
            title: 'Complete Project Proposal',
            tags: ['work', 'urgent'],
            status: 'in_progress',
            ownerIndex: 0, // John's Work Account
            dueDate: '2024-10-01',
            accessIndices: [0, 2, 3] // Project A and Project B Accounts
        },
        {
            title: 'Plan Team Building Event',
            tags: ['work', 'social'],
            status: 'not_started',
            ownerIndex: 2, // Project A Account
            dueDate: '2024-11-15',
            accessIndices: [0, 1, 2, 3] // Work, Personal, and Project B Accounts
        }
    ]
};