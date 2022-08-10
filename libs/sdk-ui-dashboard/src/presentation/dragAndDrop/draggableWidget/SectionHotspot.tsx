// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { getDropZoneDebugStyle } from "../debug";
import {
    addLayoutSection,
    selectIsWidgetPlaceholderShown,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import { SectionDropZoneBox } from "./SectionDropZoneBox";
import { DashboardLayoutSectionBorderLine } from "./DashboardLayoutSectionBorder";
import { insightRef, insightTitle } from "@gooddata/sdk-model";
import {
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
} from "../../dragAndDrop/types";
import { getSizeInfo } from "../../../_staging/layout/sizing";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler";

export type RowPosition = "above" | "below";

interface ISectionHotspotProps {
    index: number;
    targetPosition?: RowPosition;
}

export const SectionHotspot: React.FC<ISectionHotspotProps> = (props) => {
    const { index, targetPosition } = props;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const isWidgetPlaceholderShown = useDashboardSelector(selectIsWidgetPlaceholderShown);

    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler();
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler();

    const { run: addNewSectionWithInsight } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    const { run: addNewSectionWithInsightPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const newSectionIndex = event.payload.index;
            handleInsightPlaceholderDrop(newSectionIndex, 0);
        },
    });

    const { run: addNewSectionWithKpiPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const newSectionIndex = event.payload.index;
            handleKpiPlaceholderDrop(newSectionIndex, 0);
        },
    });

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    const { insight } = item;
                    const sizeInfo = getSizeInfo(settings, "insight", insight);
                    addNewSectionWithInsight(index, {}, [
                        {
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
                        },
                    ]);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    addNewSectionWithKpiPlaceholder(index, {});
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    addNewSectionWithInsightPlaceholder(index, {});
                }
            },
            hover: () => {
                if (isWidgetPlaceholderShown) {
                    dispatch(uiActions.clearWidgetPlaceholder());
                }
            },
        },
        [
            dispatch,
            isWidgetPlaceholderShown,
            settings,
            handleKpiPlaceholderDrop,
            index,
            addNewSectionWithInsight,
            addNewSectionWithInsightPlaceholder,
            addNewSectionWithKpiPlaceholder,
        ],
    );

    if (!canDrop) {
        return null;
    }

    const isLast = targetPosition === "below";

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div
            className={cx("row-hotspot-container", {
                last: isLast && canDrop,
                "s-last-drop-position": isLast && canDrop,
                hidden: !canDrop,
            })}
        >
            <div className={cx("row-hotspot", { hidden: !canDrop })} style={{ ...debugStyle }} ref={dropRef}>
                <div className="new-row-dropzone">
                    {isOver ? (
                        <SectionDropZoneBox isOver={isOver} />
                    ) : (
                        <DashboardLayoutSectionBorderLine position="top" status="muted" />
                    )}
                </div>
            </div>
        </div>
    );
};
