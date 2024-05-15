const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenSevice = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const { refresh } = require('../controllers/user-controller');
const axios = require('axios')
const https = require('https')
const itiluserShema = require('../models/itil-model');
const oneCompanyItil = require('../models/company-itil-model');
const commentModel = require('../models/comment-model');
const oneTaskModel = require('../models/oneTask-model');

class UserSevice {
    async registration(email, password) {
        const candidate = await UserModel.findOne( {email} );

        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        };

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({email, password: hashPassword, activationLink});
    
        await mailService.sendActivationMail(process.env.SMTP_USER, `${process.env.API_URL}/api/activate/${activationLink}`, email);

        const userDto = new UserDto(user);
        const tokens = tokenSevice.generateTokens( {...userDto} );

        await tokenSevice.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        }
    }

    async activate1(activationLink) {
        const user = await UserModel.findOne({activationLink})

        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }

        user.isActivated = true;
        user.admin = 1;
        await user.save();
    }

    async activate2(activationLink) {
        const user = await UserModel.findOne({activationLink})

        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }

        user.isActivated = true;
        user.admin = 2;
        await user.save();
    }

    async activate3(activationLink) {
        const user = await UserModel.findOne({activationLink})

        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }

        user.isActivated = true;
        user.admin = 3;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})

        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким Email не найден!')
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }

        const userDto = new UserDto(user);
        const tokens = tokenSevice.generateTokens({...userDto});

        await tokenSevice.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = tokenSevice.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnathorizedError();
        }

        const userData = tokenSevice.validateRefreshToken(refreshToken);
        const tokenFromDb = tokenSevice.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnathorizedError();
        }

        const user = await UserModel.findById(userData.id)
        const userDto = new UserDto(user);
        const tokens = tokenSevice.generateTokens({...userDto});

        await tokenSevice.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }

    async getItilUser() {
        const agent = new https.Agent({
            rejectUnauthorized: false
        })        

        try {
            const itiluser = await axios.get(`${process.env.API_ITIL}/users`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return itiluser.data.map(user => new itiluserShema(user.ОсновнойEmail, user.Наименование, user.Уид))
        } catch (e) {
            next(e)
        }
    }

    async getOneCompany(uid) {
        const onecompany = await axios.get(`${process.env.API_ITIL}/company/${uid}`, {
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        return onecompany.data.map(company => new oneCompanyItil(company.Организация))
    }

    async setTask(obj, email) {
        const setonetask = await axios.post(`${process.env.API_ITIL}/settask/${email}`, obj,{
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        return '200'
    }

    async getComment(uid, tasktype) {
        try {   
            const res = await axios.get(`${process.env.API_ITIL}/comment/${uid}/${tasktype}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map(comment => new commentModel(comment.UserName, comment.Текст, comment.Дата))
        } catch (e) {
            return e
        }
    }

    async getOneTask(uid, tasktype) {
        try {
            const res = await axios.get(`${process.env.API_ITIL}/getonetask/${uid}/${tasktype}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map(onetask => new oneTaskModel(onetask.CurrentStage,
                                                            onetask.DateOfCompletion,
                                                            onetask.DateOfCreation,
                                                            onetask.Executor,
                                                            onetask.Initiator,
                                                            onetask.Number,
                                                            onetask.OrganizationClient,
                                                            onetask.OrganizationExecutor,
                                                            onetask.Priority,
                                                            onetask.Service,
                                                            onetask.TaskName,
                                                            onetask.TaskType,
                                                            onetask.UID
                                                        ))
        } catch (e) {
            return e
        }
    }

    async setNewComment(obj, uid, tasktype) {
        await axios.post(`${process.env.API_ITIL}/comment/${uid}/${tasktype}`, obj, {
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        return '200'
    }

    async getAllTask(email) {
        try {
            const allTask = await axios.get(`${process.env.API_ITIL}/tasksget/${email}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return allTask.data.map(onetask => new oneTaskModel(onetask.CurrentStage,
                                                            onetask.DateOfCompletion,
                                                            onetask.DateOfCreation,
                                                            onetask.Executor,
                                                            onetask.Initiator,
                                                            onetask.Number,
                                                            onetask.OrganizationClient,
                                                            onetask.OrganizationExecutor,
                                                            onetask.Priority,
                                                            onetask.Service,
                                                            onetask.TaskName,
                                                            onetask.TaskType,
                                                            onetask.UID
            ))
        } catch (e) {
            return e
        }
    }
}

module.exports = new UserSevice()