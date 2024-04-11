const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const https = require('https');
const axios = require('axios')
const itiluserShema = require('../models/itil-model')

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидции!', errors.array()));
            }

            const {email, password} = req.body;
            const userData = await userService.registration(email, password);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} );

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            
            const userData = await userService.login(email, password);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} );

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            
            res.clearCookie('refreshToken');

            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate1(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate1(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async activate2(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate2(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async activate3(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate3(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            
            const userData = await userService.refresh(refreshToken);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} );

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();

            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async getItilUsers(req, res, next) {
        try {
            const itiluser = await userService.getItilUser()

            return res.json(itiluser)
        } catch (e) {
            next(e)
        }
    }

    async getOneCompany(req, res, next) {
        try {
            const oneCompanyItil = await userService.getOneCompany(req.params.uid)

            return res.json(oneCompanyItil)
        } catch (e) {
            next(e)
        }
    }

    async setTask(req, res, next) {
        try {
            const obj = req.body[0]

            const setTask = await userService.setTask(obj)

            return res.json(setTask)
        } catch (e) {
            next(e)
        }
    }

    async getComment(req, res, next) {
        try {
            const comment = await userService.getComment(req.params.uid, req.params.tasktype)

            return res.json(comment)
        } catch (e) {
            next(e)
        }
    }

    async getOneTask(req, res, next) {
        try{
            const oneTask = await userService.getOneTask(req.params.uid, req.params.tasktype)

            return res.json(oneTask)
        } catch(e) {
            next(e)
        }
    }

    async setComment(req, res, next) {
        try {
            await userService.setNewComment(req.body[0], req.params.uid, req.params.tasktype)

            return '200'
        } catch (e) {
            next(e)
        }
    }

    async getAllTask(req, res, next) {
        try {
            const allTask = await userService.getAllTask(req.params.email)

            return res.json(allTask)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController();