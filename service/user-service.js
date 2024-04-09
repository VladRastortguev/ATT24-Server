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
const itiluserShema = require('../models/itil-model')

class UserSevice {
    async registration(email, password) {
        const candidate = await UserModel.findOne( {email} );

        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        };

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({email, password: hashPassword, activationLink});
    
        await mailService.sendActivationMail(process.env.SMTP_USER, `${process.env.API_URL}/api/activate/${activationLink}`);

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
                }, 
            })

            return itiluser.data.map(user => new itiluserShema(user.ОсновнойEmail, user.Наименование, user.Уид))
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserSevice()