// (C) 2023 GoodData Corporation

import React from "react";
import { IUserGroup } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";
import noop from "lodash/noop.js";

import { ListMode } from "../types.js";

import { DetailRow } from "./DetailRow.js";
import { userManagementMessages } from "../../../locales.js";

export interface IUserGroupDetailsViewProps {
    userGroup: IUserGroup;
    mode: ListMode;
    onChange?: (user: IUserGroup) => void;
}

export const UserGroupDetailsView: React.FC<IUserGroupDetailsViewProps> = ({ userGroup, mode, onChange }) => {
    const intl = useIntl();

    if (!userGroup) {
        return null;
    }

    return (
        <div className="gd-user-management-dialog-detail">
            <DetailRow
                labelText={intl.formatMessage(userManagementMessages.userGroupName)}
                value={userGroup.name}
                mode={mode}
                onChange={(name) => onChange({ ...userGroup, name })}
            />
            <DetailRow
                labelText={intl.formatMessage(userManagementMessages.userGroupId)}
                value={userGroup.id}
                mode={mode}
                disabled={true}
                onChange={noop}
            />
        </div>
    );
};
