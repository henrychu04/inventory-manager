const inquirer = require('inquirer');
inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function main() {
    try {
        await client.connect();

        answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What do you want to do?',
                choices: [
                    'Add an item',
                    'Edit an item',
                    'Delete an item',
                    'List all items'
                ]
            },
            {
                type: 'input',
                name: 'edit_item',
                message: 'Select an item to edit',
                when: function(answers) {
                    return answers.action == 'Edit an item';
                }
            },
            {
                type: 'input',
                name: 'delete_item',
                message: 'Input id to delete',
                when: function(answers) {
                    return answers.action == 'Delete an item';
                }
            },
            {
                type: 'list',
                name: 'type',
                message: 'Type',
                choices: [
                    'Expense',
                    'Deposit'
                ],
                when: function(answers) {
                    return answers.action == 'Add an item';
                }
            },    
            {
                type: 'datetime',
                name: 'date',
                message: 'Date',
                when: function(answers) {
                    return answers.action == 'Add an item';
                }
            },
            {
                type: 'input',
                name: 'name',
                message: 'Name',
                when: function(answers) {
                    return answers.action == 'Add an item';
                }
            },
            {
                type: 'number',
                name: 'e_amount',
                message: 'Amount',
                when: function(answers) {
                    return answers.type == 'Expense';
                }  
            },
            {
                type: 'number',
                name: 'd_amount',
                message: 'Amount',
                when: function(answers) {
                    return answers.type == 'Deposit';
                }
            }
            
        ])

        console.log(answers);

        if (answers.action == 'Add an item') {
            date = answers.date.getDate().toString();
            month = (answers.date.getMonth() + 1).toString();
            year = answers.date.getFullYear().toString();
            full_date = `${month}/${date}/${year}`;

            console.log(full_date);

            await insertItem(client, answers, full_date);
        } else if (answers.action == 'Edit an item') {
           
        } else if (answers.action == 'Delete an item') {

        } else if (answers.action == 'List all items') {
            await list_all(client);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();

async function list_all(client) {
    db = client.db('inventory');
    collection = db.collection('items');
    
    all_items = [];
    items = await collection.find().toArray();

    for (i = 0; i < items.length; i++) {
        console.log(items[i]);
    }
}

async function addToMonth(client, item, id, month) {
    db = client.db('inventory');
    collection = db.collection('month');

    if (item.expense == 0) {
        await collection.insertOne({
            month: {
                deposit: {
                    _id: id
                }
            }
        })
    } else {
        await collection.insertOne({
            month: {
                expense: {
                    _id: id
                }
            }
        })
    }
}

async function sync(client, item, id) {
    month = parseInt(item.date.split('/')[0]);

    switch (month) {
        case 1:
            await addToMonth(client, item, id, 1);
            break;
        case 2:
            await addToMonth(client, item, id, 2);
            break;
        case 3:
            await addToMonth(client, item, id, 3);
            break;
        case 4:
            await addToMonth(client, item, id, 4);
            break;
        case 5:
            await addToMonth(client, item, id, 5);
            break;
        case 6:
            await addToMonth(client, item, id, 6);
            break;
        case 7:
            await addToMonth(client, item, id, 7);
            break;
        case 8:
            await addToMonth(client, item, id, 8);
            break;
        case 9:
            await addToMonth(client, item, id, 9);
            break;
        case 10:
            await addToMonth(client, item, id, 10);
            break;
        case 11:
            await addToMonth(client, item, id, 11);
            break;
        case 12:
            await addToMonth(client, item, id, 12);
            break;
        default:
            break;
    }
}

async function deleteItem(client) {
    db = client.db('inventory');
    collection = db.collection('items');

    query = { name: 'Test' };
    item = await collection.findOne(query);

    await collection.deleteOne(query);

    await collection.find().toArray((err, items) => {
        console.log(items);
    });
}

async function editItem(client) {
    db = client.db('inventory');
    collection = db.collection('items');

    query = { name: 'Test' };
    newVal = { $set: { date: '12/03/2019'} };

    await collection.updateOne(query, newVal);

    await collection.find().toArray((err, items) => {
        console.log(items);
    });
}

async function insertItem(client, answers, full_date) {
    db = client.db('inventory');
    collection = db.collection('items');

    item = {
        name: answers.name,
        expense: answers.e_amount,
        deposit: answers.d_amount,
        date: full_date
    }

    id = '';

    await collection.insertOne(item, function(err, result) {
        id = result.insertedId
    });

    await sync(client, item, id);

    await collection.find().toArray((err, items) => {
        console.log(items);
    });
}

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};