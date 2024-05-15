const Router = require('express').Router;
const userController = require('../controllers/user-controller')
const {body} = require('express-validator');
const authMiddlewaer = require('../middlewaers/auth-middlewaer')

const router = new Router();

router.post('/registration', 
            body('email').isEmail(), 
            body('password').isLength({min: 3, max: 32}), 
            userController.registration);
router.post('/login',                     userController.login);
router.post('/logout',                    userController.logout);
router.get('/activate/:link/1',           userController.activate1);
router.get('/activate/:link/2',           userController.activate2);
router.get('/activate/:link/3',           userController.activate3);
router.get('/refresh',                    userController.refresh);
router.get('/users', authMiddlewaer,      userController.getUsers);

router.get('/itiluser',                   userController.getItilUsers);
router.get('/onecompany/:uid',            userController.getOneCompany);
router.post('/settask/:email',            userController.setTask);
router.get('/getcomment/:uid/:tasktype',  userController.getComment);
router.get('/getonetask/:uid/:tasktype',  userController.getOneTask);
router.post('/setcomment/:uid/:tasktype', userController.setComment);
router.get('/getalltask/:email',          userController.getAllTask);

module.exports = router