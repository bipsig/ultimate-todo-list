const users = [
    {user_id: 1, username: "sagnik", email: "sagnik@gmail.com", password: "sagnik123", lists: [1,2], items: [4,8]},
    {user_id: 2, username: "bipasha", email: "bipasha@gmail.com", password: "bipasha123", lists: [3], items: [6,7]},
    {user_id: 3, username: "mayank", email: "mayank@gmail.com", password: "mayank123", lists: [], items: []}
];

const lists = [
    {list_id: 1, list_name: "Work", user_id: 1, items: [1,2]},
    {list_id: 2, list_name: "Project", user_id: 1, items: [3]},
    {list_id: 3, list_name: "Work", user_id: 2, items: [5]},
];

const items = [
    {item_id: 1, name: "Stand Up Meet", completed: true},
    {item_id: 2, name: "Create Merge Request", completed: true},
    {item_id: 3, name: "Work on Portfolio", completed: true},
    {item_id: 4, name: "Read a novel", completed: false},
    {item_id: 5, name: "Talk to the Manager", completed: false},
    {item_id: 6, name: "Eat Food", completed: false},
    {item_id: 7, name: "Drink Water", completed: true},
    {item_id: 8, name: "Give review for the novel", completed: false},
];

export default { users, lists, items };
