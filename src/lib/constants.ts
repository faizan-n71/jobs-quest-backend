export const ERROR_MESSAGES = {
  Default: "Something Went Wrong",
  InvalidInput: "The Provided Inputs Are Invalid",
  USER: {
    Creation: "User Could Not Be Created",
    NotExists: "User With The Given Credentials Does Not Exist",
    NoToken: "Authentication Token Does Not Exist",
    IncorrectToken: "Authentication Token Was Not Correct",
    UpdateInvalidData: "The Provided Data Was Not Valid",
    ActionUnauthorized: "You Cannot Perform This Action",
    UsernameExists: "Username Already Exists",
    EmailExists: "Email Already Exists",
  },
  ORGANIZATION: {
    NoId: "Organization ID Must Be Provided",
    NotExists: "Organization Does Not Exist",
  },
  JOB: {
    NotExists: "Job Does Not Exist",
    NoId: "Job ID Must Be Provided",
    NoProposal: "Job Proposal Must Be Provided",
  },
};

export const SUCCESS_MESSAGES = {
  USER: {
    LoggedIn: "Logged In Successfully",
    AlreadyLoggedIn: "You Are Already Logged In",
    Retrieval: "Retrieval Successful",
    LoggedOut: "Logged Out Successfully",
    Registered: "Created The User Successfully",
    UpdatedAccount: "Updated The Account Successfully",
  },
  ORGANIZATION: {
    Create: "Created The Organization Successfully",
    Delete: "Deleted The Organization Successfully",
    Fetch: "Fetched The Organization(s) Successfully",
    Update: "Updated The Organization Successfully",
  },
  JOB: {
    Create: "Created The Job Successfully",
    Fetch: "Successfully Fetched The Jobs",
    Update: "Successfully Updated The Job",
    AppliedAlready: "You Have Applied For The Job Already",
    Apply: "You Have Applied For The Job Successfully",
  },
};
