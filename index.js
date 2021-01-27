const express = require('express');
const app = express();
const db = require("./src/config/db");
const userRouter = require('./src/controllers/userController')
const authRouter = require('./src/middleware/auth')
require('dotenv/config')

app.use(express.urlencoded({
    extended: true
}));

app.use('/api/v1/', authRouter);
app.use('/api/v1/user', userRouter);

db.authenticate().then(() => console.log("Connection to db success"));

app.listen(process.env.PORT, () => {
    console.log(`App listens to port ${process.env.PORT}`);
});