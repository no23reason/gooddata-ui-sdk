// (C) 2022 GoodData Corporation
import React, { ComponentType, ComponentPropsWithRef } from "react";
import { useDashboardSelector } from "../../model";

// TODO just a mock, replace by the real deal
const selectRenderMode = (): "view" | "edit" => "edit";

/**
 * Returns a component that wraps components for different render modes and automatically chooses the correct one.
 *
 * @param components - the components to choose from
 * @public
 */
export function renderModeAware<T extends ComponentType<any>>(components: {
    ViewComponent: T;
    EditComponent?: T;
}): ComponentType<ComponentPropsWithRef<T>> {
    // TODO maybe improve handling of displayName to improve naming in dev tools
    return function RenderModeAware(props: ComponentPropsWithRef<T>) {
        const { ViewComponent, EditComponent } = components;
        const renderMode = useDashboardSelector(selectRenderMode);

        if (renderMode === "edit" && EditComponent) {
            return <EditComponent {...props} />;
        }

        return <ViewComponent {...props} />;
    };
}
