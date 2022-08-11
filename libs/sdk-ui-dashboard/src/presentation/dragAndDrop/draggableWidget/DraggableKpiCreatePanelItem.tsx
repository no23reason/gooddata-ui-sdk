// (C) 2022 GoodData Corporation
import React, { useMemo } from "react";

import {
    selectIsInEditMode,
    useDashboardDispatch,
    useDashboardSelector,
    eagerRemoveSectionItem,
    selectWidgetPlaceholder,
} from "../../../model";
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

    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    const handleDragEnd = useMemo<IDraggableCreatePanelItemProps["onDragEnd"]>(
        () => (didDrop) => {
            if (!didDrop && widgetPlaceholder) {
                dispatch(eagerRemoveSectionItem(widgetPlaceholder.sectionIndex, widgetPlaceholder.itemIndex));
            }
        },
        [dispatch, widgetPlaceholder],
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
