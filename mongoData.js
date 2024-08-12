import Item from "./models/items.js";
import List from "./models/lists.js";
import User from "./models/users.js";


const item1 = new Item ({
    item_name: "Stand Up Meet", 
    completed: true 
});

const item2 = new Item ({
    item_name: "Create Merge Request", 
    completed: false
});

const item3 = new Item ({
    item_name: "Work on Portfolio", 
    completed: false
});

const item4 = new Item ({
    item_name: "Read a Novel", 
    completed: false
});

const item5 = new Item ({
    item_name: "Talk to the Manager", 
    completed: true 
});

const item6 = new Item ({
    item_name: "Eat Food", 
    completed: false
});

const item7 = new Item ({
    item_name: "Drink Water", 
    completed: true 
});

const item8 = new Item ({
    item_name: "Give review for the novel", 
    completed: true 
});


const mongoItems = [item1, item2, item3, item4, item5, item6, item7, item8];

const list1 = new List ({
    list_name: "Work",
    items: ['66ba2fa05a2c4c35791cbbea', '66ba2fa05a2c4c35791cbbeb']
});

const list2 = new List ({
    list_name: "Project",
    items: ['66ba2fa05a2c4c35791cbbec']
});

const list3 = new List ({
    list_name: "Work",
    items: ['66ba2fa05a2c4c35791cbbee']
});

const mongoLists = [list1, list2, list3];

const user1 = new User ({
    username: 'Sagnik',
    password: 'sagnik123',
    email: 'sagnik@gmail.com',
    lists: ['66ba3195072415144ce86e26', '66ba3195072415144ce86e27'],
    items: ['66ba2fa05a2c4c35791cbbed', '66ba2fa05a2c4c35791cbbf1']
});

const user2 = new User ({
    username: 'Bipasha',
    password: 'bipasha123',
    email: 'bipasha@gmail.com',
    lists: ['66ba3195072415144ce86e28'],
    items: ['66ba2fa05a2c4c35791cbbef', '66ba2fa05a2c4c35791cbbf0']
});

const mongoUsers = [user1, user2];

export { mongoItems, mongoLists, mongoUsers };