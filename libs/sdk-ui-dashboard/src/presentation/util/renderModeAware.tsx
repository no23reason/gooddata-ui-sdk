// (C) 2022 GoodData Corporation
import React, { ComponentType, ComponentPropsWithRef } from "react";
import { useDashboardSelector } from "../../model";
import { DefaultDashboardAttributeFilter, IDashboardAttributeFilterProps } from "../filterBar";
import { DefaultDashboardKpi, IDashboardKpiProps, IDashboardWidgetProps } from "../widget";

// TODO just a mock, replace by the real deal
type DashboardRenderMode = "view" | "edit";
const selectDashboardRenderMode = (): DashboardRenderMode => "edit";

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
        const dashboardRenderMode = useDashboardSelector(selectDashboardRenderMode);

        if (dashboardRenderMode === "edit" && EditComponent) {
            return <EditComponent {...props} />;
        }

        return <ViewComponent {...props} />;
    };
}

//
//
//

/**
 * There is more nuance to be considered here, the edit mode for a component/widget is not a single component,
 * rather a set of different components related to each other. Below is the proposed mechanism to specify these sets.
 *
 * First define the different components that can constitute a set.
 */

interface DashboardRenderModeAwareProps {
    renderMode: DashboardRenderMode;
}

interface CustomComponentBase<TMainProps> {
    /**
     * The main body of the component
     */
    Main: ComponentType<TMainProps & DashboardRenderModeAwareProps>;
}

interface DraggingProps {
    // TODO
}

interface DraggableComponent {
    /**
     * Component shown when it is being dragged somewhere.
     */
    Dragging: ComponentType<DraggingProps>;
}

interface WidgetConfigPanelProps {
    // TODO
}

interface ConfigurableWidget {
    /**
     * Component used to render the insides of the configuration panel.
     */
    ConfigPanel: ComponentType<WidgetConfigPanelProps>;
}

interface CreatableComponent {
    /**
     * Component used to render the item in the left drawer menu used to create a new instance of this component on the dashboard
     */
    DrawerItem: ComponentType;
}

interface CreatableSkeletonComponent {
    /**
     * Component used to render the item before the initial configuration is done.
     */
    CreatingSkeleton: ComponentType;
}

/**
 * Sample definition of what sets are needed for each widget/component type
 */

type AttributeFilterComponentSet = CustomComponentBase<IDashboardAttributeFilterProps> &
    DraggableComponent &
    CreatableSkeletonComponent &
    CreatableComponent;

const attributeFilterComponentSet: AttributeFilterComponentSet = {
    Main: DefaultDashboardAttributeFilter,
    Dragging: () => <div>dragging the attribute filter somewhere</div>,
    DrawerItem: () => <div>showing the drawer item for attribute filter in the left drawer</div>,
};

type KpiWidgetComponentSet = CustomComponentBase<IDashboardKpiProps> &
    DraggableComponent &
    CreatableComponent &
    CreatableSkeletonComponent &
    ConfigurableWidget;

const kpiWidgetComponentSet: KpiWidgetComponentSet = {
    Main: DefaultDashboardKpi,
    Dragging: () => <div>dragging the KPI somewhere</div>,
    DrawerItem: () => <div>showing the drawer item for KPI in the left drawer</div>,
    CreatingSkeleton: () => (
        <div>
            KPI placeholder shown while it is configured for the first time after being dropped in the layout
        </div>
    ),
    ConfigPanel: () => <div>Config panel for KPIs</div>,
};

type CustomWidgetComponentSet = CustomComponentBase<IDashboardWidgetProps> &
    DraggableComponent &
    Partial<ConfigurableWidget> & // if no ConfigPanel then the widget is not configurable (or some default config panel will be used for filter settings?)
    Partial<CreatableComponent>; // if no CreateItem then the widget cannot be created by dragging from the left drawer

/**
 * Sample usage of the component set
 */

// in reality this would check the contexts or whatever
const mockGetKpiComponentSet = (): KpiWidgetComponentSet => kpiWidgetComponentSet;

const KpiCreatingPlaceholder = () => {
    const componentSet = mockGetKpiComponentSet();
    // the given component knows which of the items in teh component set it wants
    const { CreatingSkeleton: CreatingPlaceholder } = componentSet;

    return <CreatingPlaceholder />;
};
