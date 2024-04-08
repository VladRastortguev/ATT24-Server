const ApiError = require('../exceptions/api-error')
const TokenService = require('../service/token-service')

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnathorizedError());
        }

        

        const accesToken = authorizationHeader.split(' ')[1];

        if(!accesToken) {
            const newAccesToken = authorizationHeader;
            if (!newAccesToken) {
                return next(ApiError.UnathorizedError());
            }

            const userData = TokenService.validateAccesToken(newAccesToken);
            if (!userData) {
                return next(ApiError.UnathorizedError());
            }

            req.user = userData;

            next();
        } else {
            const userData = TokenService.validateAccesToken(accesToken);
            if (!userData) {
                return next(ApiError.UnathorizedError());
            }

            req.user = userData;

            next();
        }
    } catch (e) {
        return next(ApiError.UnathorizedError());
    }
}