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

        while (true) {
            answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What do you want to do?',
                    choices: [
                        'Add an item',
                        'Edit an item',
                        'Delete an item',
                        'List specific month',
                        'List all items',
                        'Update sale',
                        'Sync',
                        'Exit'
                    ]
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
                await deleteItem(client);
            } else if (answers.action == 'List specific month') {
                await list_specific_month(client);
            } else if (answers.action == 'List all items') {
                await list_all(client);
            } else if (answers.action == 'Update sale') {
                await update_sale(client);
            } else if (answers.action == 'Sync') {
                await sync(client);
            } else if (answers.action == 'Exit') {
                client.close();
                break;
            }
        }
    } catch (e) {
        console.error(e);
    }
}

main();

async function update_sale(client) {
    db = client.db('inventory');
    items_coll = db.collection('items');
    month_coll = db.collection('month');

    month = await inquirer.prompt([
        {
            type: 'list',
            name: 'month',
            message: 'Choose a month to list: ',
            choices: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ]
        }
    ]);

    if (month.month === 'January') {
        cursor = await month_coll.find({ month: 0 });
    } else if (month.month === 'February') {
        cursor = await month_coll.find({ month: 1 });
    } else if (month.month === 'March') {
        cursor = await month_coll.find({ month: 2 });
    } else if (month.month === 'April') {
        cursor = await month_coll.find({ month: 3 });
    } else if (month.month === 'May') {
        cursor = await month_coll.find({ month: 4 });
    } else if (month.month === 'June') {
        cursor = await month_coll.find({ month: 5 });
    } else if (month.month === 'July') {
        cursor = await month_coll.find({ month: 6 });
    } else if (month.month === 'August') {
        cursor = await month_coll.find({ month: 7 });
    } else if (month.month === 'September') {
        cursor = await month_coll.find({ month: 8 });
    } else if (month.month === 'October') {
        cursor = await month_coll.find({ month: 9 });
    } else if (month.month === 'November') {
        cursor = await month_coll.find({ month: 10 });
    } else if (month.month === 'December') {
        cursor = await month_coll.find({ month: 11 });
    }

    console.log(month);

    while (await cursor.hasNext()) {
        var item = await cursor.next();

        if (item.expense == null) {
            console.log(await items_coll.findOne({ _id: item.deposit._id }));
        } else {
            console.log(await items_coll.findOne({ _id: item.expense._id }));
        }
    }

    update = await inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Input id to update:'
        },
        {
            type: 'datetime',
            name: 'sale_date',
            message: 'Input sale date:'
        },
        {
            type: 'input',
            name: 'revenue',
            message: 'Input sale revenue:'
        }
    ]);

    console.log(update);

    await items_coll.updateOne({ _id: new ObjectId(update.id) },
        { $set:
            {
                revenue: update.revenue,
                sale_date: update.sale_date
            }
        }
    )
    .then(console.log('Item updated'));
}

async function list_specific_month(client) {
    db = client.db('inventory');
    items_coll = db.collection('items');
    month_coll = db.collection('month');

    month = await inquirer.prompt([
        {
            type: 'list',
            name: 'month',
            message: 'Choose a month to list: ',
            choices: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ]
        }
    ]);

    console.log(month);

    if (month.month === 'January') {
        cursor = await month_coll.find({ month: 0 });
    } else if (month.month === 'February') {
        cursor = await month_coll.find({ month: 1 });
    } else if (month.month === 'March') {
        cursor = await month_coll.find({ month: 2 });
    } else if (month.month === 'April') {
        cursor = await month_coll.find({ month: 3 });
    } else if (month.month === 'May') {
        cursor = await month_coll.find({ month: 4 });
    } else if (month.month === 'June') {
        cursor = await month_coll.find({ month: 5 });
    } else if (month.month === 'July') {
        cursor = await month_coll.find({ month: 6 });
    } else if (month.month === 'August') {
        cursor = await month_coll.find({ month: 7 });
    } else if (month.month === 'September') {
        cursor = await month_coll.find({ month: 8 });
    } else if (month.month === 'October') {
        cursor = await month_coll.find({ month: 9 });
    } else if (month.month === 'November') {
        cursor = await month_coll.find({ month: 10 });
    } else if (month.month === 'December') {
        cursor = await month_coll.find({ month: 11 });
    }

    var expenses = [];
    var deposits = [];

    while (await cursor.hasNext()) {
        var item = await cursor.next();
        
        if (item.expense == null) {
            deposits.push(await items_coll.findOne({ _id: item.deposit._id }));
        } else {
            expenses.push(await items_coll.findOne({ _id: item.expense._id }));
        }
    }

    expenses = JSON.parse(JSON.stringify(expenses));
    deposits = JSON.parse(JSON.stringify(deposits));

    var expenses_total = 0;
    var deposits_total = 0;

    console.log('\nExpenses:');

    expenses.forEach(function(item) {
        expenses_total += item.expense;
        console.log(item);
    });

    console.log('\nDeposits:');

    deposits.forEach(function(item) {
        deposits_total += item.deposit;
        console.log(item);
    });

    console.log(`\nTotal expenses: ${expenses_total}`);
    console.log(`Total deposits: ${deposits_total}`);
    console.log(`Final value: ${deposits_total - expenses_total}`);
}

async function list_all(client) {
    db = client.db('inventory');
    items_coll = db.collection('items');
    
    console.log(await items_coll.find().toArray());
}

async function addToMonth(client, item) {
    db = client.db('inventory');
    month_coll = db.collection('month');

    if (item.expense == null) {
        await month_coll.insertOne({
            month: item.date.getMonth(),
            deposit: {
                _id: item._id
            }
        });
    } else {
        await month_coll.insertOne({
            month: item.date.getMonth(),
            expense: {
                _id: item._id
            }
        });
    }
}

async function sync(client) {
    try {
        db = client.db('inventory');
        items_coll = db.collection('items');
        month_coll = db.collection('month');

        await items_coll.find().forEach(async function(item) {
            var match = false;

            await month_coll.find().forEach(function(month) {
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
                await addToMonth(client, item);
            }
        });

        await month_coll.find().forEach(async function(month) {
            var need_deletion = true;

            await items_coll.find().forEach(function(item) {
                if (month.expense == undefined) {
                    if (month.deposit._id.equals(item._id)) {
                        need_deletion = false;
                    }
                } else if (month.deposit == undefined) {
                    if (month.expense._id.equals(item._id)) {
                        need_deletion = false;
                    }
                }
            });

            if (need_deletion) {
                await month_coll.deleteOne({ _id: new ObjectId(month._id) });
            }
        });
    } catch (err) {
        console.log(err);
    } finally {
        console.log('Synced');
    }
}

async function deleteItem(client) {
    db = client.db('inventory');
    collection = db.collection('items');

    console.log(await collection.find().toArray());

    deletion = await inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Input id to delete:'
        }
    ]);

    console.log(deletion);

    await collection.deleteOne({ _id: new ObjectId(deletion.id) })
    .then(await sync(client))
    .then(console.log('Item deleted'));
}

async function editItem(client) {
    db = client.db('inventory');
    collection = db.collection('items');
    month_coll = db.collection('month');

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
    ]);

    console.log(edits);

    var old = await collection.findOne({ _id: new ObjectId(edits.id) });

    await collection.updateOne({ _id: new ObjectId(edits.id) },
        { $set:
            {
                'name': edits.name,
                'date': edits.date,
                'expense': edits.expense,
                'deposit': edits.deposit
            }
        }
    )
    .then(console.log('Item edited'));

    if (old.date.getMonth() != edits.date.getMonth()) {
        console.log('not equal');
        var old_month_coll = await month_coll.find({ month: old.date.getMonth() });

        await old_month_coll.forEach(async function(item) {
            if (item.expense == null) {
                if (item.deposit._id == edits.id) {
                    await month_coll.deleteOne({ _id: item._id });
                }
            } else {
                if (item.expense._id == edits.id) {
                    await month_coll.deleteOne({ _id: item._id });
                }
            }
        });

        await sync(client);
    }
}

async function insertItem(client, answers) {
    db = client.db('inventory');
    collection = db.collection('items');

    item = {
        name: answers.name,
        date: answers.date,
        expense: answers.expense,
        deposit: answers.deposit
    }

    await collection.insertOne(item)
    .then(await sync(client))
    .then(console.log('Item added'));
}