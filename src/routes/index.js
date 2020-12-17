const { Router } = require('express');
const { check, validationResult } = require('express-validator');
const alert = require('alert');
const router = Router();

const fireadmin = require('firebase-admin');
const settings = require(process.env.SETTINGS); // not enough, but is an example...
fireadmin.initializeApp({
    credential: fireadmin.credential.cert(settings),
    databaseURL: process.env.FIREBASE_URL
});

const db = fireadmin.database();

router.get('/', (req, res) => {
    db.ref('Expense').once('value',  snapshot_ => {
        db.ref('Income').once('value', snapshot => {

            const incomes = snapshot_.val()
            const expenses = snapshot.val();

            let movements = [];
            for ( let [id, expense] of (Object.entries(expenses || []) )) {
                expense.id = id;
                expense.date = new Date(expense.date).toLocaleDateString();
                movements.push(expense);
            }

            for ( let [id, income] of (Object.entries(incomes || []) )) {
                income.id = id;
                income.date = new Date(income.date).toLocaleDateString();
                movements.push(income);
            }

            movements.sort( (a, b) => b.date - a.date );
            res.render('index', {data : movements});
        });
    }) 
});

router.post('/add', [
    check('description', 'The description cannot be empty').isLength({min:1, max:50}),
    check('amount', 'The amount value must be a number').isNumeric()
],async (req, res) => {

    let errors = validationResult(req);
    console.log(errors);

    if (errors.errors.length === 0) {
        console.log(req.body);
        const { description, amount, category, type } = req.body;
        const movement = {
            description, amount, category, type,
            date: new Date().getTime()
        };

        await db.ref(movement.type).push(movement);
        res.redirect('/');
    }
    else {
        for (let error of errors.errors) {
            if (error) alert(`${error.msg}`);
        }
        res.redirect('/');
    }
});

router.get('/delete/:id/:type', (req, res) => {
    const { id, type } = req.params;
    db.ref(`${type}/${id}`).remove();
    res.redirect('/');
});

module.exports = router;
