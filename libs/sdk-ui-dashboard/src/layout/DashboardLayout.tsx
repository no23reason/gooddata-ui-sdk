// (C) 2020 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../dashboard/DashboardComponentsContext";
import { DashboardLayoutProps } from "./types";

/**
 * @internal
 */
export const DashboardLayout = (props: DashboardLayoutProps): JSX.Element => {
    const { LayoutComponent } = useDashboardComponentsContext();

    return <LayoutComponent {...props} />;
};
