const inquirer = require('inquirer');
require('dotenv').config();
inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectId = require('mongodb').ObjectID;

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
                    'List all items',
                    'Sync'
                ]
            },
            {
                type: 'input',
                name: 'delete_item',
                message: 'Input id to delete:',
                when: function(answers) {
                    return answers.action == 'Delete an item';
                }
            },
            {
                type: 'input',
                name: 'name',
                message: 'Name:',
                when: function(answers) {
                    return answers.action == 'Add an item';
                }
            },
            {
                type: 'datetime',
                name: 'date',
                message: 'Date:',
                when: function(answers) {
                    return answers.action == 'Add an item';
                }
            },
            {
                type: 'list',
                name: 'type',
                message: 'Type:',
                choices: [
                    'Expense',
                    'Deposit'
                ],
                when: function(answers) {
                    return answers.action == 'Add an item';
                }
            },    
            {
                type: 'number',
                name: 'expense',
                message: 'Expense amount:',
                when: function(answers) {
                    return answers.type == 'Expense';
                }  
            },
            {
                type: 'number',
                name: 'deposit',
                message: 'Deposit amount:',
                when: function(answers) {
                    return answers.type == 'Deposit';
                }
            }
        ])

        console.log(answers);

        if (answers.action == 'Add an item') {
            await insertItem(client, answers);
        } else if (answers.action == 'Edit an item') {
            await editItem(client);
        } else if (answers.action == 'Delete an item') {

        } else if (answers.action == 'List all items') {
            await list_all(client);
        } else if (answers.action == 'Sync') {
            await sync(client);
        }
    } catch (e) {
        console.error(e);
    } finally {
        // await client.close();
    }
}

main();

async function list_all(client) {
    db = client.db('inventory');
    collection = db.collection('items');
    
    console.log(await collection.find().toArray());
}

async function addToMonth(client, item, id) {
    db = client.db('inventory');
    collection = db.collection('month');

    var id = item._id;
    var month = parseInt(item.date.split('/')[0]);

    if (item.expense == null) {
        await collection.insertOne({
            month: month,
            deposit: {
                _id: id
            }
        })
    } else {
        await collection.insertOne({
            month: month,
            expense: {
                _id: id
            }
        })
    }
}

async function sync(client) {
    try {
        db = client.db('inventory');
        items_collection = db.collection('items');
        month_collection = db.collection('month');

        var colls = await db.listCollections().toArray();
        var month_exist = false;

        for (var i = 0; i < colls.length; i++) {
            if (coll[i].name === 'month') month_exist = true;
        }

        if (month_exist) {
            await items_collection.find().forEach(async function(item) {
                var match = false;

                await month_collection.find().forEach(function(month) {
                    if (month.expense == undefined) {
                        if (month.deposit._id.equals(item._id)) {
                            match = true;
                        }
                    } else if (month.deposit == undefined) {
                        if (month.expense._id.equals(item._id)) {
                            match = true;
                        }
                    }
                });

                if (!match) {
                    await addToMonth(client, item, item._id);
                }
            });
        } else {
            await items_collection.find().forEach(async function(item) {
                await addToMonth(client, item, item._id);
            });
        }
    } catch (err) {
        console.log(err);
    } finally {
        console.log('Synced');
    }
}

async function deleteItem(client) {
    db = client.db('inventory');
    collection = db.collection('items');

    
}

async function editItem(client) {
    db = client.db('inventory');
    collection = db.collection('items');
    console.log(await collection.find().toArray());

    edits = await inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Input id to edit:'
        },
        {
            type: 'input',
            name: 'name',
            message: 'Enter new name:'
        },
        {
            type: 'datetime',
            name: 'date',
            message: 'Enter new date:'
        },
        {
            type: 'list',
            name: 'type',
            message: 'Select new type:',
            choices: [
                'Expense',
                'Deposit'
            ]
        },
        {
            type: 'number',
            name: 'expense',
            message: 'Enter new expense amount:',
            when: function(edits) {
                return edits.type == 'Expense';
            }
        },
        {
            type: 'number',
            name: 'deposit',
            message: 'Enter new deposit amount:',
            when: function(edits) {
                return edits.type == 'Deposit';
            }
        }
    ])

    var old = await collection.findOne(
        { _id: new ObjectId(edits.id) }
    );

    console.log(old);

    var month = (edits.date.getMonth() + 1).toString();
    var date = edits.date.getDate().toString();
    var year = edits.date.getFullYear().toString();
    var full_date = `${month}/${date}/${year}`;

    if (old.date.split('/')[0] != month) {
        month_collection = db.collection('month');


    }

    // await collection.findOneAndReplace(
    //     { _id: new ObjectId(edits.id) },
    //     {
    //         'name': edits.name,
    //         'date': full_date,
    //         'expense': edits.expense,
    //         'deposit': edits.deposit
    //     }
    // );

    console.log(await collection.find().toArray());
}

async function insertItem(client, answers) {
    db = client.db('inventory');
    collection = db.collection('items');

    var month = (answers.date.getMonth() + 1).toString();
    var date = answers.date.getDate().toString();
    var year = answers.date.getFullYear().toString();
    var full_date = `${month}/${date}/${year}`;

    item = {
        name: answers.name,
        date: full_date,
        expense: answers.expense,
        deposit: answers.deposit,
    }

    id = '';

    await collection.insertOne(item, function(result) {
        id = result.insertedId
    });

    await sync(client);

    console.log(await collection.find().toArray());
}