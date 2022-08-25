// (C) 2022 GoodData Corporation
import { IDashboard, IDashboardLayout } from "@gooddata/sdk-model";
import flow from "lodash/flow";
import { DashboardLayoutBuilder } from "./fluidLayout";
import {
    AddReadonlyLayoutItem,
    AddReadonlyLayoutSection,
    DashboardLayoutReadOnlyAdditions,
    DashboardLayoutReadOnlyAdditionsGroup,
    DashboardLayoutReadOnlyAdditionSource,
} from "../../model/types/commonTypes";
import { ExtendedDashboardWidget } from "../../model/types/layoutTypes";
import { pluginDebugStr } from "../plugins/pluginUtils";

function addPluginInfoToMessage(plugin: DashboardLayoutReadOnlyAdditionSource | undefined, message: string) {
    return plugin ? `${pluginDebugStr(plugin)}: ${message}` : message;
}

function logTransformationError(plugin: DashboardLayoutReadOnlyAdditionSource | undefined, error?: any) {
    // eslint-disable-next-line no-console
    console.error(
        addPluginInfoToMessage(
            plugin,
            "An error has occurred while transforming fluid dashboard layout. Skipping failed transformation.",
        ),
        error,
    );
}

const evaluateDashboardReadOnlyItemAdditions =
    (additions: AddReadonlyLayoutItem[]) =>
    (layout: IDashboardLayout<ExtendedDashboardWidget>): IDashboardLayout<ExtendedDashboardWidget> => {
        return additions.reduce((_currentLayout, itemAddition) => {
            const { sectionIndex, itemIndex, item } = itemAddition;
            const builder = DashboardLayoutBuilder.for(layout);

            const actualSectionIdx = sectionIndex === -1 ? builder.facade().sections().count() : sectionIndex;

            builder.modifySection(actualSectionIdx, (sectionBuilder) => {
                sectionBuilder.addItem(item, itemIndex === -1 ? undefined : itemIndex);
                return sectionBuilder;
            });
            return builder.build();
        }, layout);
    };

const evaluateDashboardReadOnlySectionAdditions =
    (additions: AddReadonlyLayoutSection[]) =>
    (layout: IDashboardLayout<ExtendedDashboardWidget>): IDashboardLayout<ExtendedDashboardWidget> => {
        return additions.reduce((_currentLayout, itemAddition) => {
            const { index, section } = itemAddition;

            const builder = DashboardLayoutBuilder.for(layout);

            builder.addSection(section, index === -1 ? undefined : index);
            return builder.build();
        }, layout);
    };

function evaluateDashboardReadOnlyAdditionsInner(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    additions: DashboardLayoutReadOnlyAdditions,
): IDashboardLayout<ExtendedDashboardWidget> {
    return flow(
        evaluateDashboardReadOnlyItemAdditions(additions.items),
        evaluateDashboardReadOnlySectionAdditions(additions.sections),
    )(layout);
}

export function evaluateDashboardReadOnlyAdditions(
    dashboard: IDashboard<ExtendedDashboardWidget>,
    additions: DashboardLayoutReadOnlyAdditionsGroup[],
): IDashboard<ExtendedDashboardWidget> {
    if (!dashboard.layout) {
        return dashboard;
    }

    const transformedLayout = additions.reduce((layout, curr) => {
        const currentRound = curr.additionsFactory(dashboard);
        try {
            return evaluateDashboardReadOnlyAdditionsInner(layout, currentRound);
        } catch (e) {
            logTransformationError(curr.source, e);
        }
        return layout;
    }, dashboard.layout);

    return { ...dashboard, layout: transformedLayout };
}
