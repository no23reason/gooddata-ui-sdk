// (C) 2022 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-model";
import flow from "lodash/flow";
import { DashboardLayoutBuilder } from "./fluidLayout";
import {
    AddReadonlyLayoutItem,
    AddReadonlyLayoutSection,
    DashboardLayoutReadOnlyAdditions,
    DashboardLayoutReadOnlyAdditionSource,
} from "../../model/types/commonTypes";
import { ExtendedDashboardWidget } from "../../model/types/layoutTypes";
import { pluginDebugStr } from "../plugins/pluginUtils";

// TODO where to put the descriptor type?
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
        return additions.reduce((currentLayout, itemAddition) => {
            const { sectionIndex, itemIndex, item } = itemAddition;
            const builder = DashboardLayoutBuilder.for(layout);

            const actualSectionIdx = sectionIndex === -1 ? builder.facade().sections().count() : sectionIndex;

            try {
                builder.modifySection(actualSectionIdx, (sectionBuilder) => {
                    sectionBuilder.addItem(item, itemIndex === -1 ? undefined : itemIndex);
                    return sectionBuilder;
                });
                return builder.build();
            } catch (e) {
                logTransformationError(itemAddition.source, e);
                return currentLayout;
            }
        }, layout);
    };

const evaluateDashboardReadOnlySectionAdditions =
    (additions: AddReadonlyLayoutSection[]) =>
    (layout: IDashboardLayout<ExtendedDashboardWidget>): IDashboardLayout<ExtendedDashboardWidget> => {
        return additions.reduce((currentLayout, itemAddition) => {
            const { index, section } = itemAddition;
            const builder = DashboardLayoutBuilder.for(layout);

            try {
                builder.addSection(section, index === -1 ? undefined : index);
                return builder.build();
            } catch (e) {
                logTransformationError(itemAddition.source, e);
                return currentLayout;
            }
        }, layout);
    };

export function evaluateDashboardReadOnlyAdditions(
    layout: IDashboardLayout<ExtendedDashboardWidget> | undefined,
    additions: DashboardLayoutReadOnlyAdditions,
): IDashboardLayout<ExtendedDashboardWidget> | undefined {
    if (!layout) {
        return layout;
    }

    return flow(
        evaluateDashboardReadOnlyItemAdditions(additions.items),
        evaluateDashboardReadOnlySectionAdditions(additions.sections),
    )(layout);
}
