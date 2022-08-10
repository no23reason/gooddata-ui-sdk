// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";

import { selectSettings, useDashboardDispatch, useDashboardSelector, uiActions } from "../../../model";
import { getSizeInfo } from "../../../_staging/layout/sizing";
import { KPI_PLACEHOLDER_WIDGET_ID } from "../../../widgets";

export function useKpiPlaceholderDropHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    return useCallback(
        (sectionIndex: number, itemIndex: number) => {
            const sizeInfo = getSizeInfo(settings, "kpi");
            dispatch(uiActions.selectWidget(idRef(KPI_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setKpiDateDatasetAutoOpen(true));
            dispatch(
                uiActions.setWidgetPlaceholder({
                    itemIndex,
                    sectionIndex,
                    size: {
                        height: sizeInfo.height.default!,
                        width: sizeInfo.width.default!,
                    },
                    type: "kpi",
                }),
            );
        },
        [dispatch, settings],
    );
}
