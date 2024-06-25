import { SetMetadata } from '@nestjs/common';

const ROLES_KEY = 'roles';

const Roles = (...role) => SetMetadata(ROLES_KEY, role);

module.exports = { Roles, ROLES_KEY };