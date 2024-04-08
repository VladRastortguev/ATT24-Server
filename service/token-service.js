require('dotenv').config()
const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenSevice {
    generateTokens(payload) {
        const accesToken = jwt.sign(payload, `${process.env.JWT_ACCES_SEKRET}`, {expiresIn: '30s'});
        const refreshToken = jwt.sign(payload, `${process.env.JWT_REFRESH_SEKRET}`, {expiresIn: '30d'});

        return {
            accesToken,
            refreshToken
        }
    }

    validateAccesToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCES_SEKRET)
            return userData;
        } catch(e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SEKRET)
            return userData;
        } catch(e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne( {user: userId} );

        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        const token = await tokenModel.create( {user: userId, refreshToken } );
        
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken});
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken});
        return tokenData;
    }
}

module.exports = new TokenSevice()