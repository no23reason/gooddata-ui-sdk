// (C) 2022 GoodData Corporation
import React from "react";

import { uiActions, selectIsInEditMode, useDashboardDispatch, useDashboardSelector } from "../../../model";
import { useDashboardDrag } from "../useDashboardDrag";
import {
    CustomDashboardKpiCreatePanelItemComponent,
    CustomDashboardKpiCreatePanelItemComponentProps,
} from "../types";

type DraggableKpiCreatePanelItemProps = {
    CreatePanelItemComponent: CustomDashboardKpiCreatePanelItemComponent;
    createPanelItemComponentProps: CustomDashboardKpiCreatePanelItemComponentProps;
};

export const DraggableKpiCreatePanelItem: React.FC<DraggableKpiCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    createPanelItemComponentProps,
}) => {
    const dispatch = useDashboardDispatch();
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const [, dragRef] = useDashboardDrag({
        dragItem: {
            type: "kpi-placeholder",
        },
        canDrag: isInEditMode && !createPanelItemComponentProps.disabled,
        hideDefaultPreview: false,
        dragEnd: (_, monitor) => {
            if (!monitor.didDrop()) {
                dispatch(uiActions.clearWidgetPlaceholder());
            }
        },
    });
    return (
        <div ref={dragRef}>
            <CreatePanelItemComponent {...createPanelItemComponentProps} />
        </div>
    );
};
