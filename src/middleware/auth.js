const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');
require('dotenv/config')

const {
    registerValidation,
    loginValidation
} = require('../config/validation')

var authRouter = express.Router();

authRouter.use(bodyParser.urlencoded({
    extended: false
}));
authRouter.use(bodyParser.json());

// Register 
authRouter.post('/register', async (req, res) => {

    const {
        error
    } = registerValidation(req.body)
    if (error) return res.status(400).json({
        status: res.statusCode,
        message: error.details[0].message
    })

    try {
        const {
            username,
            email,
            password,
            name,
        } = req.body;

        const saltRounds = 10;
        const hashedPw = await bcrypt.hash(password, saltRounds);

        const usernameDuplicate = await User.findOne({
            where: {
                username: username
            }
        })

        const emailDuplicate = await User.findOne({
            where: {
                email: email
            }
        })

        if (usernameDuplicate || emailDuplicate) {
            res.status(400).json({
                status: res.statusCode,
                message: 'This Username or Password Already Exist'
            });
        } else {
            const created = await User.create({
                username: username,
                email: email,
                hashed_password: hashedPw,
                name: name
            })

            res.json(created);
        }
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
});

// Login 
authRouter.post('/login', async (req, res) => {

    const {
        error
    } = loginValidation(req.body)
    if (error) return res.status(400).json({
        status: res.statusCode,
        message: error.details[0].message
    })

    await User
        .findOne({
            where: {
                username: req.body.username
            }
        }).then(user => {
            if (!user) {
                return res.status(404).send({
                    status: res.statusCode,
                    message: "Username Not Found."
                });
            }

            bcrypt.compare(req.body.password, user.hashed_password, function (err, result) {
                if (!result) {
                    return res.status(401).send({
                        status: res.statusCode,
                        token: null,
                        message: "Invalid Password!"
                    });
                }
            });
            let token = jwt.sign({
                user_id: user.user_id
            }, process.env.SECRET_KEY, {
                expiresIn: 86400
            });
            let tokenData = {
                token: token,
                user_id: user.user_id,
            };

            Token.update({
                    user_id: user.user_id,
                    token: token
                }, {
                    where: {
                        user_id: user.user_id
                    }
                })
                .then(data => {
                    if (data[0] !== 0) {
                        res.status(200).send({
                            status: res.statusCode,
                            message: "Update Token",
                            token: token
                        });
                    } else {
                        Token.create(tokenData)
                            .then(datatoken => {
                                res.status(201).send({
                                    status: res.statusCode,
                                    message: "Created Token",
                                    token: datatoken.token
                                });
                            })
                    }

                })
                .catch((error) => res.status(400).send(error));
        })
});

// Logout
authRouter.post('/logout', async (req, res) => {

    const dataToken = req.headers['authorization']
    if (!dataToken) return res.status(401).send({
        status: res.statusCode,
        message: 'No token provided.'
    });

    await Token.findOne({
        where: {
            token: dataToken
        }
    }).then(data => {
        if (data[0] === 0) {
            res.status(401).send({
                status: res.statusCode,
                message: "Failed to authenticate token",
            });
        } else {
            Token.destroy({
                where: {
                    user_id: data.user_id
                }
            }).then(() => {
                res.send({
                    status: res.statusCode,
                    message: "User Logout Successfully",
                })
            })
        }
    }).catch((error) => res.status(401).send({
        status: res.statusCode,
        message: "Failed to authenticate token"
    }));
});

module.exports = authRouter;