module.exports = class UserDto {
    email;
    id;
    isActivated;
    admin;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.admin = model.admin;
    }
}