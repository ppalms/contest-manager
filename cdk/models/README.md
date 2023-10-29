# NoSQL Workbench Models

JSON models can be imported into NoSQL Workbench to visualize access patterns and play with test data

## Administration - admin-table.json

### Users

    PK: TENANT#<TenantId>#USER#<UserId>
    User attributes (first name, last name, etc.) under SK: DETAILS

    Look up all users for a tenant in GSI1 under
        GSI1PK: TENANT#<TenantId>#USERS
        GSI1SK: <RoleName>

### Organizations

    PK: TENANT#<TenantId>#ORG#<OrgId>
    Org details under SK: DETAILS
    Org users under SK: USER#<UserId>

    Look up all orgs for a tenant in GSI1 under
        GSI1PK: TENANT#<TenantId>#ORGS
        GSI1SK: <OrgType>

### Contests

    PK: TENANT#<TenantId>#CONTEST#<ContestId>
    Contest details under SK: DETAILS
    Contest manager users under SK: USER#<UserId>

    Look up all contests for a tenant in GSI1 under
        GSI1PK: TENANT#<TenantId>#CONTESTS
        GSI1SK: <ContestType>
