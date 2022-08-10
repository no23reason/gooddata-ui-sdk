// (C) 2022 GoodData Corporation
import React, { useMemo } from "react";

import { uiActions, selectIsInEditMode, useDashboardDispatch, useDashboardSelector } from "../../../model";
import { CustomDashboardKpiCreatePanelItemComponent, DraggableItem } from "../types";
import { DraggableCreatePanelItem, IDraggableCreatePanelItemProps } from "../DraggableCreatePanelItem";

interface IDraggableKpiCreatePanelItemProps {
    CreatePanelItemComponent: CustomDashboardKpiCreatePanelItemComponent;
    disabled?: boolean;
}

const dragItem: DraggableItem = {
    type: "kpi-placeholder",
};

export const DraggableKpiCreatePanelItem: React.FC<IDraggableKpiCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    disabled,
}) => {
    const dispatch = useDashboardDispatch();
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const handleDragEnd = useMemo<IDraggableCreatePanelItemProps["onDragEnd"]>(
        () => (didDrop) => {
            if (!didDrop) {
                dispatch(uiActions.clearWidgetPlaceholder());
            }
        },
        [dispatch],
    );

    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            disabled={disabled}
            canDrag={isInEditMode && !disabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
            onDragEnd={handleDragEnd}
        />
    );
};
