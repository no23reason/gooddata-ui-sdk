// (C) 2022 GoodData Corporation
import React from "react";
import classNames from "classnames";
import { IInsight } from "@gooddata/sdk-model";

import { useDashboardSelector, selectIsInEditMode, useDashboardDispatch, uiActions } from "../../../model";
import { useDashboardDrag } from "../useDashboardDrag";
import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
} from "../types";

/**
 * @internal
 */
export interface IDraggableInsightListItemProps {
    ListItemComponent: CustomDashboardInsightListItemComponent;
    listItemComponentProps: CustomDashboardInsightListItemComponentProps;
    insight: IInsight;
}

/**
 * @internal
 */
export function DraggableInsightListItem({
    ListItemComponent,
    listItemComponentProps,
    insight,
}: IDraggableInsightListItemProps) {
    const dispatch = useDashboardDispatch();
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: {
                type: "insightListItem",
                insight,
            },
            canDrag: isInEditMode,
            hideDefaultPreview: false,
            dragEnd: (_, monitor) => {
                if (!monitor.didDrop()) {
                    dispatch(uiActions.clearWidgetPlaceholder());
                }
            },
        },
        [isInEditMode, insight],
    );

    return (
        <div className={classNames({ "is-dragging": isDragging })} ref={dragRef}>
            <ListItemComponent {...listItemComponentProps} />
        </div>
    );
}
