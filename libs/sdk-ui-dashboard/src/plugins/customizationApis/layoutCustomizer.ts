// (C) 2021-2022 GoodData Corporation
import invariant from "ts-invariant";
import last from "lodash/last";
import { FluidLayoutCustomizationFn, IDashboardLayoutCustomizer } from "../customizer";
import { IDashboardCustomizationContext } from "./customizationContext";
import { FluidLayoutCustomizer } from "./fluidLayoutCustomizer";
import { DashboardLayoutReadOnlyAdditions, DashboardLayoutReadOnlyAdditionsGroup } from "../../model";
import { DashboardPluginDescriptor } from "../plugin";

interface Transformation {
    customization: FluidLayoutCustomizationFn;
    pluginDescriptor: DashboardPluginDescriptor | undefined;
}

interface GroupedTransformation {
    customizations: FluidLayoutCustomizationFn[];
    pluginDescriptor: DashboardPluginDescriptor | undefined;
}

export class DefaultLayoutCustomizer implements IDashboardLayoutCustomizer {
    private sealed = false;
    private readonly transformations: Transformation[] = [];

    constructor(private readonly context: IDashboardCustomizationContext) {}

    public customizeFluidLayout = (
        customizationFn: FluidLayoutCustomizationFn,
    ): IDashboardLayoutCustomizer => {
        if (!this.sealed) {
            this.transformations.push({
                pluginDescriptor: this.context.getCurrentPlugin(),
                customization: customizationFn,
            });
        } else {
            this.context.warn(
                `Attempting to add layout customization outside of plugin registration. Ignoring.`,
            );
        }

        return this;
    };

    public sealCustomizer = (): IDashboardLayoutCustomizer => {
        this.sealed = true;

        return this;
    };

    public getReadOnlyAdditions = (): DashboardLayoutReadOnlyAdditionsGroup[] => {
        const snapshot = [...this.transformations];

        // group consecutive transformations from the same plugin into one
        // this allows us to run all the transformations of the same plugin at once
        let lastPlugin: DashboardPluginDescriptor | undefined = undefined;
        const grouped: GroupedTransformation[] = [];
        for (const transformation of snapshot) {
            if (transformation.pluginDescriptor !== lastPlugin || grouped.length === 0) {
                // new group
                grouped.push({
                    customizations: [transformation.customization],
                    pluginDescriptor: transformation.pluginDescriptor,
                });
                lastPlugin = transformation.pluginDescriptor;
            } else {
                // existing group
                last(grouped)!.customizations.push(transformation.customization);
            }
        }

        return grouped.reduce((acc: DashboardLayoutReadOnlyAdditionsGroup[], curr) => {
            const alreadyInResult = acc.find((res) => res.source === curr.pluginDescriptor);
            if (alreadyInResult) {
                invariant(false, "Adding the same plugin multiple times");
            } else {
                acc.push({
                    additionsFactory: (dashboard) => {
                        const { layout } = dashboard;
                        const emptyAdditions: DashboardLayoutReadOnlyAdditions = {
                            items: [],
                            sections: [],
                        };
                        /*
                         * Once the dashboard component supports multiple layout types, then the code here must only
                         * perform the transformations applicable for the dashboard's layout type..
                         *
                         * At this point, since dashboard only supports fluid layout, the code tests that there is a
                         * layout in a dashboard and is of expected type. This condition will be always true for
                         * non-empty, non-corrupted dashboards
                         */
                        if (!layout || layout.type !== "IDashboardLayout") {
                            return emptyAdditions;
                        }

                        const customizer = new FluidLayoutCustomizer(this.context); // TODO just logger? pass plugin descriptor
                        // call out to the plugin-provided functions with the current value of the layout & the
                        // customizer to use. the custom functions may now inspect the layout & use the customizer
                        // to add sections or items. customizer will not reflect those changes immediately. instead
                        // it will accumulate those operations
                        curr.customizations.forEach((fn) => fn(layout, customizer)); // TODO this is not correct, the following fns need to see the updated layout
                        // now make extract the addition definitions from the customizer
                        return customizer.getReadOnlyAdditions();
                    },
                    source: curr.pluginDescriptor,
                });
            }
            return acc;
        }, []);
    };
}
