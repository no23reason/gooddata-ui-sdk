// (C) 2021-2022 GoodData Corporation
import { FluidLayoutCustomizationFn, IDashboardLayoutCustomizer } from "../customizer";
import { IDashboardCustomizationContext } from "./customizationContext";
import { FluidLayoutCustomizer } from "./fluidLayoutCustomizer";
import { DashboardLayoutReadOnlyAdditions, DashboardReadOnlyAdditionsFactory } from "../../model";
import { evaluateDashboardReadOnlyAdditions } from "../../_staging/dashboard/evaluateDashboardReadOnlyAdditions";

export class DefaultLayoutCustomizer implements IDashboardLayoutCustomizer {
    private sealed = false;
    private readonly fluidLayoutTransformations: FluidLayoutCustomizationFn[] = [];

    constructor(private readonly context: IDashboardCustomizationContext) {}

    public customizeFluidLayout = (
        customizationFn: FluidLayoutCustomizationFn,
    ): IDashboardLayoutCustomizer => {
        if (!this.sealed) {
            this.fluidLayoutTransformations.push(customizationFn);
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

    public getReadOnlyAdditionsFactory = (): DashboardReadOnlyAdditionsFactory => {
        const snapshot = [...this.fluidLayoutTransformations];
        return (dashboard) => {
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

            const res = snapshot.reduce(
                (acc, fn) => {
                    const customizer = new FluidLayoutCustomizer(this.context);
                    const { layout: currentLayout, additions } = acc;
                    try {
                        // call out to the plugin-provided function with the current value of the layout & the
                        // customizer to use. the custom function may now inspect the layout & use the customizer
                        // to add sections or items. customizer will not reflect those changes immediately. instead
                        // it will accumulate those operations
                        fn(currentLayout, customizer);
                        // now make extract the addition definitions from the customizer
                        const newAdditions = customizer.getReadOnlyAdditions();
                        return {
                            // apply the transformations so that subsequent factories "see" the updated layout
                            layout: evaluateDashboardReadOnlyAdditions(currentLayout, newAdditions)!,
                            additions: {
                                items: [...additions.items, ...newAdditions.items],
                                sections: [...additions.sections, ...newAdditions.sections],
                            },
                        };
                    } catch (e) {
                        this.context.error(
                            "An error has occurred while transforming fluid dashboard layout. Skipping failed transformation.",
                            e,
                        );

                        return acc;
                    }
                },
                { layout, additions: emptyAdditions },
            );

            return res.additions;
        };
    };
}
