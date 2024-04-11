class oneTaskModel {
    constructor(CurrentStage, DateOfCompletion, DateOfCreation, Executor, Initiator, Number, OrganizationClient, OrganizationExecutor, Priority, Service, TaskName, TaskType, UID) {
            this.CurrentStage = CurrentStage;
            this.DateOfCompletion = DateOfCompletion;
            this.DateOfCreation = DateOfCreation;
            this.Executor = Executor;
            this.Initiator = Initiator;
            this.Number = Number;
            this.OrganizationClient = OrganizationClient;
            this.OrganizationExecutor = OrganizationExecutor;
            this.Priority = Priority;
            this.Service = Service;
            this.TaskName = TaskName;
            this.TaskType = TaskType;
            this.UID = UID;      
    }      
}

module.exports = oneTaskModel

// class oneTaskModel {
//     constructor (onetask) {
//         this.onetask = onetask
//     }
// }

// module.exports = oneTaskModel