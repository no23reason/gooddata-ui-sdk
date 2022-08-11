// (C) 2022 GoodData Corporation
import React, { useEffect, useRef } from "react";
import invariant from "ts-invariant";

import { isKpiPlaceholderWidget } from "../../../widgets";
import { removeSectionItem, useDashboardDispatch } from "../../../model";
import { DashboardItem, DashboardItemContent } from "../../presentationComponents";
import { ConfigurationBubble, useWidgetSelection } from "../common";
import { CustomDashboardWidgetComponent } from "../widget/types";
import { KpiPlaceholderConfigurationPanel } from "./KpiPlaceholderConfigurationPanel";

/**
 * @internal
 */
export const DefaultDashboardKpiPlaceholderWidget: CustomDashboardWidgetComponent = (props) => {
    const { widget, screen } = props;
    invariant(isKpiPlaceholderWidget(widget));

    const dispatch = useDashboardDispatch();

    const { isSelectable, isSelected } = useWidgetSelection(widget.ref);

    // keep information if this widget has been selected in the past
    const wasSelected = useRef(isSelected);
    useEffect(() => {
        if (isSelected) {
            wasSelected.current = true;
        }
    }, [isSelected]);

    useEffect(() => {
        // if the widget was selected in the past and is now not selected, it has just been unselected
        // -> remove its widget placeholder
        if (wasSelected.current && !isSelected) {
            dispatch(removeSectionItem(widget.sectionIndex, widget.itemIndex));
        }
    }, [dispatch, isSelected, widget.itemIndex, widget.sectionIndex]);

    return (
        <DashboardItem className="is-selected is-placeholder is-edit-mode" screen={screen}>
            <DashboardItemContent isSelected={isSelected} isSelectable={isSelectable}>
                <ConfigurationBubble>
                    <KpiPlaceholderConfigurationPanel widget={widget} />
                </ConfigurationBubble>
                <div className="kpi-placeholder select-measure" />
            </DashboardItemContent>
        </DashboardItem>
    );
};
