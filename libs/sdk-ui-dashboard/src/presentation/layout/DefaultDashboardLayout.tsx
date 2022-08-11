// (C) 2020-2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import {
    ObjRef,
    IInsight,
    objRefToString,
    isWidget,
    IDashboardLayout,
    IDashboardLayoutItem,
} from "@gooddata/sdk-model";
import { LRUCache } from "@gooddata/util";

import {
    useDashboardSelector,
    selectIsExport,
    selectIsLayoutEmpty,
    selectLayout,
    ExtendedDashboardWidget,
    selectInsightsMap,
    selectEnableWidgetCustomHeight,
    selectRenderMode,
} from "../../model";
import { useDashboardComponentsContext } from "../dashboardContexts";

import { DashboardLayoutWidget } from "./DashboardLayoutWidget";
import { EmptyDashboardError } from "./EmptyDashboardError";
import { IDashboardLayoutProps } from "./types";
import {
    DashboardLayout,
    DashboardLayoutBuilder,
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutWidgetRenderer,
} from "./DefaultDashboardLayoutRenderer";
import { RenderModeAwareDashboardLayoutSectionHeaderRenderer } from "./DefaultDashboardLayoutRenderer/RenderModeAwareDashboardLayoutSectionHeaderRenderer";
import { getMemoizedWidgetSanitizer } from "./DefaultDashboardLayoutUtils";
import { SectionHotspot } from "../dragAndDrop";

/**
 * Get dashboard layout for exports.
 *  - Create new extra rows if current row has width of widgets greater than 12
 *
 * @internal
 * @param layout - dashboard layout to modify
 * @returns transformed layout
 */
function getDashboardLayoutForExport(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
): IDashboardLayout<ExtendedDashboardWidget> {
    const dashLayout = DashboardLayoutBuilder.for(layout);
    const layoutFacade = dashLayout.facade();
    const sections = layoutFacade.sections();
    const screenSplitSections = sections.map((section) => ({
        items: section.items().asGridRows("xl"),
        header: section.header(),
    }));

    dashLayout.removeSections();
    screenSplitSections.forEach((wrappedSection) => {
        wrappedSection.items.forEach((rowSection, index) => {
            dashLayout.createSection((section) => {
                rowSection.forEach((item) => {
                    if (index === 0) {
                        section.header(wrappedSection.header);
                    }
                    section.createItem(item.size().xl, (i) => i.widget(item.widget()));
                });
                return section;
            });
        });
    });

    return dashLayout.build();
}

const itemKeyGetter: IDashboardLayoutItemKeyGetter<ExtendedDashboardWidget> = (keyGetterProps) => {
    const widget = keyGetterProps.item.widget();
    if (isWidget(widget)) {
        return objRefToString(widget.ref);
    }
    return keyGetterProps.item.index().toString();
};

/**
 * @alpha
 */
export const DefaultDashboardLayout = (props: IDashboardLayoutProps): JSX.Element => {
    const { onFiltersChange, onDrill, onError, ErrorComponent: CustomError } = props;

    const { ErrorComponent } = useDashboardComponentsContext({ ErrorComponent: CustomError });

    const layout = useDashboardSelector(selectLayout);
    const isLayoutEmpty = useDashboardSelector(selectIsLayoutEmpty);
    const enableWidgetCustomHeight = useDashboardSelector(selectEnableWidgetCustomHeight);
    const insights = useDashboardSelector(selectInsightsMap);
    const isExport = useDashboardSelector(selectIsExport);
    const renderMode = useDashboardSelector(selectRenderMode);

    const getInsightByRef = useCallback(
        (insightRef: ObjRef): IInsight | undefined => {
            return insights.get(insightRef);
        },
        [insights],
    );

    const sanitizeWidgets = useMemo(() => {
        // keep the cache local so that it is cleared when the dashboard changes for example and this component is remounted
        const cache = new LRUCache<IDashboardLayoutItem<ExtendedDashboardWidget>>({ maxSize: 100 });
        return getMemoizedWidgetSanitizer(cache);
    }, []);

    const transformedLayout = useMemo(() => {
        if (isExport) {
            return getDashboardLayoutForExport(layout);
        }

        return DashboardLayoutBuilder.for(layout)
            .modifySections((section) =>
                section.modifyItems(sanitizeWidgets(getInsightByRef, enableWidgetCustomHeight)),
            )
            .build();
    }, [layout, isExport, getInsightByRef, enableWidgetCustomHeight, sanitizeWidgets]);

    const widgetRenderer = useCallback<IDashboardLayoutWidgetRenderer<ExtendedDashboardWidget>>(
        (renderProps) => {
            return (
                <DashboardLayoutWidget
                    onError={onError}
                    onDrill={onDrill}
                    onFiltersChange={onFiltersChange}
                    {...renderProps}
                />
            );
        },
        [onError, onDrill, onFiltersChange],
    );

    return isLayoutEmpty ? (
        <EmptyDashboardError ErrorComponent={ErrorComponent} />
    ) : (
        <>
            <DashboardLayout
                className={isExport ? "export-mode" : ""}
                layout={transformedLayout}
                itemKeyGetter={itemKeyGetter}
                widgetRenderer={widgetRenderer}
                enableCustomHeight={enableWidgetCustomHeight}
                sectionHeaderRenderer={RenderModeAwareDashboardLayoutSectionHeaderRenderer}
                renderMode={renderMode}
            />
            <SectionHotspot index={transformedLayout.sections.length} targetPosition="below" />
        </>
    );
};
