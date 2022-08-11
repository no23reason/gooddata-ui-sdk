// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    useDashboardCommandProcessing,
    uiActions,
    selectWidgetPlaceholder,
    replaceSectionItem,
    DashboardItemDefinition,
} from "../../../model";
import { getSizeInfo } from "../../../_staging/layout/sizing";

export function useInsightListItemDropHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    const { run: replaceInsightOntoPlaceholder } = useDashboardCommandProcessing({
        commandCreator: replaceSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        onSuccess: (event) => {
            const ref = event.payload.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(
        (insight: IInsight) => {
            invariant(widgetPlaceholder, "cannot drop onto placeholder, there is none");

            const sizeInfo = getSizeInfo(settings, "insight", insight);
            const dashItem: DashboardItemDefinition = {
                type: "IDashboardLayoutItem",
                widget: {
                    type: "insight",
                    insight: insightRef(insight),
                    ignoreDashboardFilters: [],
                    drills: [],
                    title: insightTitle(insight),
                    description: "",
                    configuration: { hideTitle: false },
                    properties: {},
                },
                size: {
                    xl: {
                        gridHeight: sizeInfo.height.default,
                        gridWidth: sizeInfo.width.default!,
                    },
                },
            };
            replaceInsightOntoPlaceholder(
                widgetPlaceholder.sectionIndex,
                widgetPlaceholder.itemIndex,
                dashItem,
            );
        },
        [replaceInsightOntoPlaceholder, settings, widgetPlaceholder],
    );
}
