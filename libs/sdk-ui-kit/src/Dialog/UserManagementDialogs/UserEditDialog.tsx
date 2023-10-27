// (C) 2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { LoadingComponent } from "@gooddata/sdk-ui";

import { Tabs } from "../../Tabs/index.js";
import { userDialogTabsMessageLabels, userManagementMessages } from "../../locales.js";
import { Overlay } from "../../Overlay/index.js";
import { IAlignPoint } from "../../typings/positioning.js";

import { WorkspaceList } from "./Workspace/WorkspaceList.js";
import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import { UserDetailsView } from "./Details/UserDetailsView.js";
import { UserGroupsList } from "./UserGroups/UserGroupsList.js";
import { EditUserDetails } from "./Details/EditUserDetails.js";
import { AddUserGroup } from "./UserGroups/AddUserGroup.js";
import {
    useUserDialogTabs,
    useUserGroups,
    useUser,
    useWorkspaces,
    useDialogMode,
    useDeleteUser,
    useDeleteDialog,
} from "./dialogHooks.js";
import { ViewDialog } from "./ViewDialog.js";
import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { extractUserName } from "./utils.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface IUserEditDialogProps {
    userId: string;
    organizationId: string;
    isAdmin: boolean;
    onClose: () => void;
}

/**
 * @internal
 */
export const UserEditDialog: React.FC<IUserEditDialogProps> = ({
    userId,
    organizationId,
    isAdmin,
    onClose,
}) => {
    const intl = useIntl();
    const { dialogMode, setDialogMode } = useDialogMode();
    const { user, isCurrentlyAdmin, onUserChanged } = useUser(userId, organizationId, isAdmin);
    const { grantedWorkspaces, onWorkspacesChanged, removeGrantedWorkspace, updateGrantedWorkspace } =
        useWorkspaces(userId, "user", organizationId);
    const { grantedUserGroups, onUserGroupsChanged, removeGrantedUserGroup } = useUserGroups(
        userId,
        organizationId,
    );
    const { tabs, selectedTabId, setSelectedTabId } = useUserDialogTabs(
        grantedWorkspaces,
        grantedUserGroups,
        isCurrentlyAdmin,
    );
    const {
        isConfirmDeleteOpened,
        onOpenDeleteDialog,
        onCloseDeleteDialog,
        dialogOverlayClassNames,
        dialogWrapperClassNames,
    } = useDeleteDialog();
    const deleteUser = useDeleteUser(userId, organizationId, onClose);

    const { editButtonText, editButtonMode, editButtonIconClassName } = useMemo(() => {
        if (selectedTabId.id === userDialogTabsMessageLabels.workspaces.id) {
            return {
                editButtonMode: "WORKSPACE" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(userManagementMessages.addWorkspaceButton),
            };
        }
        if (selectedTabId.id === userDialogTabsMessageLabels.userGroups.id) {
            return {
                editButtonMode: "USER_GROUPS" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(userManagementMessages.addUserGroupButton),
            };
        }
        return {
            editButtonMode: "DETAIL" as const,
            editButtonIconClassName: "gd-icon-pencil gd-user-management-dialog-edit-mode-icon",
            editButtonText: intl.formatMessage(userManagementMessages.editUserButton),
        };
    }, [intl, selectedTabId]);

    const isLoaded = user !== undefined && grantedWorkspaces !== null && grantedUserGroups !== null;

    return (
        <OrganizationIdProvider organizationId={organizationId}>
            {isConfirmDeleteOpened ? (
                <DeleteConfirmDialog
                    titleText={extractUserName(user)}
                    bodyText={intl.formatMessage(userManagementMessages.deleteUserConfirmBody, {
                        br: <br />,
                    })}
                    onConfirm={deleteUser}
                    onCancel={onCloseDeleteDialog}
                />
            ) : null}
            <Overlay
                alignPoints={alignPoints}
                isModal={true}
                positionType="fixed"
                className={dialogOverlayClassNames}
            >
                {!isLoaded && <LoadingComponent className="gd-user-management-dialog-loading" />}
                <div className={dialogWrapperClassNames}>
                    {dialogMode === "VIEW" && (
                        <ViewDialog
                            dialogTitle={extractUserName(user)}
                            isAdmin={isCurrentlyAdmin}
                            deleteLinkText={intl.formatMessage(userManagementMessages.deleteUserLink)}
                            onOpenDeleteDialog={onOpenDeleteDialog}
                            onClose={onClose}
                            onEdit={() => setDialogMode(editButtonMode)}
                            editButtonText={editButtonText}
                            editButtonIconClassName={editButtonIconClassName}
                        >
                            {isCurrentlyAdmin ? (
                                <div className="gd-message progress gd-user-management-admin-alert s-admin-message">
                                    <div className="gd-message-text">
                                        {intl.formatMessage(userManagementMessages.adminAlert)}
                                    </div>
                                </div>
                            ) : null}
                            <Tabs
                                selectedTabId={selectedTabId.id}
                                onTabSelect={setSelectedTabId}
                                tabs={tabs}
                                className="gd-user-management-dialog-tabs s-user-management-tabs"
                            />
                            {selectedTabId.id === userDialogTabsMessageLabels.workspaces.id && (
                                <WorkspaceList
                                    workspaces={grantedWorkspaces}
                                    mode="VIEW"
                                    onDelete={removeGrantedWorkspace}
                                    onChange={updateGrantedWorkspace}
                                />
                            )}
                            {selectedTabId.id === userDialogTabsMessageLabels.userGroups.id && (
                                <UserGroupsList
                                    userGroups={grantedUserGroups}
                                    mode="VIEW"
                                    onDelete={removeGrantedUserGroup}
                                />
                            )}
                            {selectedTabId.id === userDialogTabsMessageLabels.details.id && (
                                <UserDetailsView user={user} isAdmin={isCurrentlyAdmin} mode="VIEW" />
                            )}
                        </ViewDialog>
                    )}
                    {dialogMode === "WORKSPACE" && (
                        <AddWorkspace
                            id={userId}
                            subjectType="user"
                            grantedWorkspaces={grantedWorkspaces}
                            onSubmit={onWorkspacesChanged}
                            onCancel={() => setDialogMode("VIEW")}
                        />
                    )}
                    {dialogMode === "USER_GROUPS" && (
                        <AddUserGroup
                            userId={userId}
                            grantedUserGroups={grantedUserGroups}
                            onSubmit={onUserGroupsChanged}
                            onCancel={() => setDialogMode("VIEW")}
                        />
                    )}
                    {dialogMode === "DETAIL" && (
                        <EditUserDetails
                            user={user}
                            isAdmin={isCurrentlyAdmin}
                            onSubmit={onUserChanged}
                            onCancel={() => setDialogMode("VIEW")}
                        />
                    )}
                </div>
            </Overlay>
        </OrganizationIdProvider>
    );
};
