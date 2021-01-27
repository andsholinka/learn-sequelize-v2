const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/User');

var userRouter = express.Router();

userRouter.use(bodyParser.urlencoded({
    extended: false
}));
userRouter.use(bodyParser.json());

// getAllUsers
userRouter.get('/', async (req, res) => {
    try {
        const getAllUser = await User.findAll({})
        res.json(getAllUser);
        // console.log(User)
    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});

// getUserById
userRouter.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                user_id: req.params.id
            }
        })
        res.json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});

// updateById
userRouter.put('/:id', async (req, res) => {
    try {

        const {
            username,
            email,
            name,
            password
        } = req.body;
        const id = req.params.id

        const updateUser = await User.update({
            username,
            email,
            name,
            password
        }, {
            where: {
                user_id: id
            }
        })

        await updateUser;

        res.status(200).json({
            status: res.statusCode,
            message: 'Berhasil Mengubah Data'
        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send("server error");
    }
});

// deleteById
userRouter.delete('/:id', async (req, res) => {
    try {
        await User.destroy({
            where: {
                user_id: req.params.id
            }
        })

        res.status(200).json({
            status: res.statusCode,
            message: 'Berhasil Mengapus Data'
        })

    } catch (err) {
        console.log(err);
        res.json({
            message: err
        });
    }
});

module.exports = userRouter;