import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import StaffModel from './models/staffModel';
import { AuthReq, AuthRes, Permissions } from '@silloky-squidgame/types';
import RolesModel from './models/rolesModel';

const calculateOverallPermissions = async (roles: string[], grantedPermissions: string[], deniedPermissions: string[]) => {
    const rolesData = await RolesModel.find({ name: { $in: roles } })
        .select("permissions")
        .lean()
        .exec();

    let allRolePermissions: string[] = [];
    rolesData.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
            allRolePermissions = [...allRolePermissions, ...role.permissions];
        }
    });

    const uniqueRolePermissions = [...new Set(allRolePermissions)];
    const permissions = new Permissions();
    permissions.applyPermissions(uniqueRolePermissions, true);
    permissions.applyPermissions(grantedPermissions, true);
    permissions.applyPermissions(deniedPermissions, false);
    return permissions.serialize();
}

export const authenticate = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body as AuthReq;

    const result = await StaffModel.findOne({ "username": username });
    if (result === null) {
        res.status(401).json({ error: 'Invalid user' });
        return;
    }

    if (!(await bcrypt.compare(password, result.pwdH))) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    const authResponse: AuthRes = {
        token: jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '24h' }),
        permissions: await calculateOverallPermissions(result.roles, result.grantedPermissions, result.deniedPermissions),
        username: username,
        name: result.name
    };
    res.json(authResponse);
    return;
};
