// (C) 2021-2022 GoodData Corporation

import { Action, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { DashboardMetaState, EmptyDashboardDescriptor } from "./metaState";
import { IDashboard } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { DashboardToLayoutTransformFn } from "../../types/commonTypes";

type MetaReducer<A extends Action> = CaseReducer<DashboardMetaState, A>;

type SetMetaPayload = {
    dashboard?: IDashboard;
};
const setMeta: MetaReducer<PayloadAction<SetMetaPayload>> = (state, action) => {
    const { dashboard } = action.payload;

    state.persistedDashboard = dashboard;
    state.descriptor = dashboard
        ? {
              title: dashboard.title,
              description: dashboard.description,
              tags: dashboard.tags,
              shareStatus: dashboard.shareStatus,
              isUnderStrictControl: dashboard.isUnderStrictControl,
              isLocked: dashboard.isLocked,
          }
        : { ...EmptyDashboardDescriptor };
};

const setDashboardTitle: MetaReducer<PayloadAction<string>> = (state, action) => {
    invariant(state.descriptor);

    state.descriptor.title = action.payload;
};
const setOngoingDashboardLayoutTransformFn: MetaReducer<
    PayloadAction<DashboardToLayoutTransformFn | undefined>
> = (state, action) => {
    state.ongoingDashboardLayoutTransformFn = action.payload;
};

export const metaReducers = {
    setMeta,
    setDashboardTitle,
    setOngoingDashboardLayoutTransformFn,
};
